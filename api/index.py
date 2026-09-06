"""Entrypoint de la función Python de Vercel.

Vercel detecta `app` (ASGI) y lo sirve. El código real vive en `backend/app/`.
`vercel.json` incluye `backend/**` en el bundle de la función.
"""

import pathlib
import sys

# Poner backend/ en el path para importar el paquete `app`.
_BACKEND = pathlib.Path(__file__).resolve().parent.parent / "backend"
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

from app.main import app  # noqa: E402  (import tras ajustar sys.path)

__all__ = ["app"]
