"""
Servidor estático de desenvolvimento — Althius Raio-X.

Igual ao `python -m http.server`, com uma diferença: manda
`Cache-Control: no-store` em tudo. Sem isso o Chrome guarda CSS e JS por
heurística e você edita o arquivo sem ver a mudança na tela.

    python .dev-server.py 5177
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

RAIZ = Path(__file__).resolve().parent


class SemCache(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, formato, *args):
        # Silencia 404 de assets ainda ausentes (vídeo e print do sinal).
        if len(args) > 1 and str(args[1]) == "404":
            return
        super().log_message(formato, *args)


def main():
    porta = int(sys.argv[1]) if len(sys.argv) > 1 else 5177
    handler = partial(SemCache, directory=str(RAIZ))
    with ThreadingHTTPServer(("127.0.0.1", porta), handler) as servidor:
        print(f"Raio-X em http://localhost:{porta}/apresentacao.html  (sem cache)")
        try:
            servidor.serve_forever()
        except KeyboardInterrupt:
            print("\nencerrado")


if __name__ == "__main__":
    main()
