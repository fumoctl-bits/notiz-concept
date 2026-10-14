#!/usr/bin/env python3
import http.server
import socket
import socketserver
import os
import sys

PORT = 8000

def get_lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't need to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

class PWAStaticServer(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Service Worker & PWA headers
        if self.path.endswith('.webmanifest') or self.path.endswith('manifest.json'):
            self.send_header('Content-Type', 'application/manifest+json')
        elif self.path.endswith('sw.js'):
            self.send_header('Service-Worker-Allowed', '/')
            self.send_header('Cache-Control', 'no-cache')
        # Allow cross-origin for local testing
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    lan_ip = get_lan_ip()

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), PWAStaticServer) as httpd:
        print("=" * 60)
        print("  🍎 Apple Notes PWA Server Running!")
        print("=" * 60)
        print(f"  Local URL:        http://localhost:{PORT}")
        print(f"  Phone / LAN URL:  http://{lan_ip}:{PORT}")
        print("=" * 60)
        print("  To install on your phone:")
        print(f"  1. Ensure phone is on the same Wi-Fi network.")
        print(f"  2. Open Safari (iOS) or Chrome (Android) and navigate to:")
        print(f"     http://{lan_ip}:{PORT}")
        print("  3. Tap 'Share' (iOS) -> 'Add to Home Screen' (➕).")
        print("  4. Press Ctrl+C in terminal to stop.")
        print("=" * 60)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")

if __name__ == '__main__':
    main()
