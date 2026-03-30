<?php
session_start();

// Load environment variables
if (file_exists(__DIR__ . '/.env.php')) {
    include_once __DIR__ . '/.env.php';
}

// Spoofing password for now if not defined in .env.php
$correct_pw = defined('ADMIN_PASSWORD') ? ADMIN_PASSWORD : 'password123';

// Handle JSON POST body
$input = json_decode(file_get_contents('php://input'), true);
if (is_array($input)) {
    $_POST = array_merge($_POST, $input);
}

header('Content-Type: application/json');

if( !isset($_POST['p']) || $_POST['p'] !== $correct_pw ){
    echo json_encode([
    	'success' => false, 
    	'msg' => 'Unauthorized'
    ]);
    exit;
}

$toonsDir = __DIR__ . '/resource/toons';

$response = [
    'success' => false,
];

$action = isset( $_POST['action'] ) ? $_POST['action'] : 'none';
if( !isset( $action ) ){
	$response->msg = 'invalid action';
	echo json_encode( $response );
	return;
}

switch ($action) {

	case 'read_toons':

		$toons = [];

		if( is_dir( $toonsDir ) ){

		    $items = scandir( $toonsDir );

		    foreach ($items as $item) {
		        if ($item === '.' || $item === '..') continue;
		        
		        $path = $toonsDir . '/' . $item;
		        if (is_dir($path)) {
		            $files = scandir($path);
		            $toonFiles = [];
		            foreach ($files as $file) {
		                if ($file === '.' || $file === '..') continue;
		                if (is_file($path . '/' . $file)) {
							$size = getimagesize($path . '/' . $file);
		                    $toonFiles[] = [
								'slug' => $file,
								'w' => $size ? $size[0] : 0,
								'h' => $size ? $size[1] : 0,
							];
		                }
		            }
		            $toons[$item] = $toonFiles;
		        }
		    }
		}
		$response = [
		    'success' => true,
		    'toons' => $toons
		];
		break;

	case 'create_toon':
		$name = isset($_POST['name']) ? trim($_POST['name']) : '';
		if (empty($name)) {
			$response = [
				'success' => false,
				'msg' => 'Toon name is required'
			];
			break;
		}

		// Basic sanitization: allow only alphanumeric, underscores, and dashes
		$sanitizedName = preg_replace('/[^a-zA-Z0-9_-]/', '', $name);
		if ($sanitizedName !== $name) {
			$response = [
				'success' => false,
				'msg' => 'Invalid characters in toon name'
			];
			break;
		}

		$newToonDir = $toonsDir . '/' . $sanitizedName;

		if (file_exists($newToonDir)) {
			$response = [
				'success' => false,
				'msg' => 'Toon already exists'
			];
		} else {
			if (mkdir($newToonDir, 0777, true)) {
				$response = [
				    'success' => true,
				    'msg' => 'Toon created successfully',
					'name' => $sanitizedName
				];
			} else {
				$response = [
				    'success' => false,
				    'msg' => 'Failed to create directory'
				];
			}
		}
		break;

	case 'delete_toon':
		$name = isset($_POST['name']) ? trim($_POST['name']) : '';
		if (empty($name)) {
			$response = [
				'success' => false,
				'msg' => 'Toon name is required'
			];
			break;
		}

		$sanitizedName = preg_replace('/[^a-zA-Z0-9_-]/', '', $name);
		$toonDir = $toonsDir . '/' . $sanitizedName;

		if (!is_dir($toonDir)) {
			$response = [
				'success' => false,
				'msg' => 'Toon directory not found'
			];
		} else {
			// Helper to recursively delete directory
			$deleteDir = function($dir) use (&$deleteDir) {
				if (!file_exists($dir)) return true;
				if (!is_dir($dir)) return unlink($dir);
				foreach (scandir($dir) as $item) {
					if ($item == '.' || $item == '..') continue;
					if (!$deleteDir($dir . DIRECTORY_SEPARATOR . $item)) return false;
				}
				return rmdir($dir);
			};

			if ($deleteDir($toonDir)) {
				$response = [
					'success' => true,
					'msg' => 'Toon deleted successfully'
				];
			} else {
				$response = [
					'success' => false,
					'msg' => 'Failed to delete toon directory'
				];
			}
		}
		break;

	case 'remove_frame':
		$name = isset($_POST['name']) ? trim($_POST['name']) : '';
		$slug = isset($_POST['slug']) ? trim($_POST['slug']) : '';

		if (empty($name) || empty($slug)) {
			$response = [
				'success' => false,
				'msg' => 'Name and slug are required'
			];
			break;
		}

		// gemini: here - these need to preserve spaces, parens, and other common special chars from client:
		$sanitizedName = preg_replace('/[^a-zA-Z0-9_ \(\)\[\]\.\+-]/', '', $name);
		$sanitizedSlug = preg_replace('/[^a-zA-Z0-9_ \(\)\[\]\.\+-]/', '', $slug);

		$filePath = $toonsDir . '/' . $sanitizedName . '/' . $sanitizedSlug;

		if (is_file($filePath)) {
			if (unlink($filePath)) {
				$response = [
					'success' => true,
					'msg' => 'Frame removed successfully'
				];
			} else {
				$response = [
					'success' => false,
					'msg' => 'Failed to remove frame'
				];
			}
		} else {
			$response = [
				'success' => false,
				'msg' => 'Frame file not found: ' . $filePath
			];
		}
		break;

	case 'upload_frame':
		$name = isset($_POST['name']) ? trim($_POST['name']) : '';
		$slug = isset($_POST['slug']) ? trim($_POST['slug']) : '';

		if (empty($name) || empty($slug)) {
			$response = [
				'success' => false,
				'msg' => 'Toon name and file name (slug) are required'
			];
			break;
		}

		if (!isset($_FILES['file'])) {
			$response = [
				'success' => false,
				'msg' => 'No file uploaded'
			];
			break;
		}

		$sanitizedName = preg_replace('/[^a-zA-Z0-9_ \(\)\[\]\.\+-]/', '', $name);
		$sanitizedSlug = preg_replace('/[^a-zA-Z0-9_ \(\)\[\]\.\+-]/', '', $slug);

		$toonDir = $toonsDir . '/' . $sanitizedName;

		if (!is_dir($toonDir)) {
			$response = [
				'success' => false,
				'msg' => 'Toon directory not found'
			];
			break;
		}

		$targetFile = $toonDir . '/' . $sanitizedSlug;

		// gemini: test here first for extant file and reject
		if (file_exists($targetFile)) {
			$response = [
				'success' => false,
				'msg' => 'Frame file already exists'
			];
			break;
		}

		if ( move_uploaded_file($_FILES['file']['tmp_name'], $targetFile) ) {
			$response = [
				'success' => true,
				'msg' => 'Frame uploaded successfully'
			];
		} else {
			$response = [
				'success' => false,
				'msg' => 'Failed to move uploaded file'
			];
		}
		break;
	
	default:
		$response = [
			'success' => false,
			'msg' => 'unknown action: ' . $_POST['action']
		];
		break;

}

echo json_encode( $response );
