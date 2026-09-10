<?php
/**
 * T-Conecta — envío del formulario de contacto
 * Sube este archivo al hosting (mismo dominio del sitio) como /enviar.php
 *
 * Si el sitio corre sobre WordPress, descomenta el bloque WP más abajo:
 * usa wp_mail() y hereda la configuración SMTP del sitio, lo que reduce
 * mucho la probabilidad de que el correo caiga en spam.
 */

declare(strict_types=1);

const DESTINO = 'tconectasiempre@gmail.com';

// Dominios autorizados para enviar (ajusta al tuyo)
const ORIGENES = ['https://tconecta.store', 'https://www.tconecta.store'];

header('Content-Type: application/json; charset=utf-8');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, ORIGENES, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit;
}

$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

$campo = static fn(string $k): string => trim((string)($data[$k] ?? ''));

$nombre    = $campo('nombre');
$apellidos = $campo('apellidos');
$email     = $campo('email');
$celular   = $campo('celular');
$empresa   = $campo('empresa');
$asunto    = $campo('asunto');
$mensaje   = $campo('mensaje');
$autoriza  = !empty($data['autorizacion']);
$honeypot  = $campo('website'); // anti-spam: debe venir vacío

if ($honeypot !== '') { echo json_encode(['ok' => true]); exit; } // bot silencioso

$errores = [];
if ($nombre === '')    { $errores[] = 'nombre'; }
if ($apellidos === '') { $errores[] = 'apellidos'; }
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { $errores[] = 'email'; }
if ($celular === '')   { $errores[] = 'celular'; }
if ($asunto === '')    { $errores[] = 'asunto'; }
if ($mensaje === '')   { $errores[] = 'mensaje'; }
if (!$autoriza)        { $errores[] = 'autorizacion'; }

if ($errores) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Campos incompletos', 'campos' => $errores]);
    exit;
}

// Evita inyección de cabeceras en el asunto
$asuntoLimpio = preg_replace('/[\r\n]+/', ' ', $asunto);
$subject = 'T-Conecta · ' . $asuntoLimpio;

$e = static fn(string $v): string => htmlspecialchars($v, ENT_QUOTES, 'UTF-8');

$cuerpo = '<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;color:#131313">'
    . '<h2 style="margin:0 0 16px">Nuevo mensaje desde T-Conecta</h2>'
    . '<table cellpadding="6" cellspacing="0" border="0" style="font-size:14px">'
    . '<tr><td><strong>Nombre</strong></td><td>' . $e($nombre . ' ' . $apellidos) . '</td></tr>'
    . '<tr><td><strong>Email</strong></td><td>' . $e($email) . '</td></tr>'
    . '<tr><td><strong>Celular</strong></td><td>' . $e($celular) . '</td></tr>'
    . '<tr><td><strong>Empresa</strong></td><td>' . $e($empresa !== '' ? $empresa : '—') . '</td></tr>'
    . '<tr><td><strong>Asunto</strong></td><td>' . $e($asunto) . '</td></tr>'
    . '<tr><td valign="top"><strong>Mensaje</strong></td><td>' . nl2br($e($mensaje)) . '</td></tr>'
    . '<tr><td><strong>Autorización de datos</strong></td><td>Sí</td></tr>'
    . '<tr><td><strong>Fecha</strong></td><td>' . $e(date('Y-m-d H:i:s')) . '</td></tr>'
    . '</table></body></html>';

/* ─── Opción A · WordPress (recomendada si el sitio corre sobre WP) ───
require_once __DIR__ . '/wp-load.php';
$enviado = wp_mail(
    DESTINO,
    $subject,
    $cuerpo,
    ['Content-Type: text/html; charset=UTF-8', 'Reply-To: ' . $nombre . ' <' . $email . '>']
);
*/

/* ─── Opción B · PHP nativo ─── */
$dominio = preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'tconecta.store');
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    'From: T-Conecta <no-reply@' . $dominio . '>',   // debe ser un buzón real del dominio
    'Reply-To: ' . $nombre . ' <' . $email . '>',
];
$enviado = mail(DESTINO, '=?UTF-8?B?' . base64_encode($subject) . '?=', $cuerpo, implode("\r\n", $headers));

if (!$enviado) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'No se pudo enviar el correo']);
    exit;
}

echo json_encode(['ok' => true]);
