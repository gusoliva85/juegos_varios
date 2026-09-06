"""FastAPI app — Mesa & Ficha.

Se sirve como función ASGI de Vercel a través de `api/index.py`.
Por ahora solo expone el health check (F0.4.4). Los routers reales se montan en fases siguientes.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Mesa & Ficha API", docs_url="/api/docs", openapi_url="/api/openapi.json")

# CORS: dominios de Vercel (producción + previews *.vercel.app) y localhost para `vercel dev`.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https://([a-z0-9-]+\.)*vercel\.app$|^http://localhost:\d+$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
