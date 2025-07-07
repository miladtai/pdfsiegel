<?php
require_once '../config/config.php';

class ADLSAuth {
    private $server;
    private $port;
    private $baseDn;
    
    public function __construct() {
        // AD LDS Konfiguration - bitte anpassen
        $this->server = "localhost"; // AD LDS Server
        $this->port = 389; // Standard LDAP Port
        $this->baseDn = "DC=example,DC=com"; // Basis DN anpassen
    }
    
    public function authenticate($username, $password) {
        // Für Entwicklung: Mock-Authentifizierung
        if ($this->mockAuth($username, $password)) {
            return $this->getUserInfo($username);
        }
        
        // Produktive AD LDS Authentifizierung
        return $this->ldapAuth($username, $password);
    }
    
    private function mockAuth($username, $password) {
        // Mock-Benutzer für Entwicklung
        $mockUsers = [
            'admin' => 'password',
            'user1' => 'password123',
            'mchairman' => 'password'
        ];
        
        return isset($mockUsers[$username]) && $mockUsers[$username] === $password;
    }
    
    private function ldapAuth($username, $password) {
        try {
            $ldapconn = ldap_connect($this->server, $this->port);
            if (!$ldapconn) {
                return false;
            }
            
            ldap_set_option($ldapconn, LDAP_OPT_PROTOCOL_VERSION, 3);
            ldap_set_option($ldapconn, LDAP_OPT_REFERRALS, 0);
            
            $userDn = "CN=" . $username . "," . $this->baseDn;
            
            if (ldap_bind($ldapconn, $userDn, $password)) {
                $result = $this->getUserInfo($username);
                ldap_close($ldapconn);
                return $result;
            }
            
            ldap_close($ldapconn);
            return false;
            
        } catch (Exception $e) {
            error_log("LDAP Auth Error: " . $e->getMessage());
            return false;
        }
    }
    
    private function getUserInfo($username) {
        // Mock-Benutzerdaten für Entwicklung
        $mockUserData = [
            'admin' => ['firstname' => 'Admin', 'lastname' => 'User', 'email' => 'admin@example.com'],
            'user1' => ['firstname' => 'John', 'lastname' => 'Doe', 'email' => 'john.doe@example.com'],
            'mchairman' => ['firstname' => 'Milad', 'lastname' => 'Chairangoon', 'email' => 'milad@example.com']
        ];
        
        if (isset($mockUserData[$username])) {
            return array_merge(['username' => $username], $mockUserData[$username]);
        }
        
        // Produktiv: LDAP-Abfrage für Benutzerdaten
        return [
            'username' => $username,
            'firstname' => 'Unknown',
            'lastname' => 'User',
            'email' => $username . '@example.com'
        ];
    }
}
?>
