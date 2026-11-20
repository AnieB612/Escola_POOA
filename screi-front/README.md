# SCREI · Front-end

Front-end web da API de cadastro escolar (projeto `java_da_depressao`).
Feito com React + TypeScript + Vite.

## Rodar

1. Deixe a **API rodando** (na pasta da API: `.\mvnw.cmd spring-boot:run`).
2. Nesta pasta:

```powershell
npm install      # só na primeira vez
npm run dev
```

3. Abra o endereço que aparecer no terminal (normalmente http://localhost:5173.
   Se a porta estiver ocupada, o Vite usa a próxima: 5174, 5175…).

O Vite repassa as chamadas `/api/...` para `http://localhost:8080` (veja `vite.config.ts`),
por isso a API não precisa de CORS.

## Telas

| Perfil | Tela | Rota da API usada |
|---|---|---|
| Todos | Entrar: escolher ou criar usuário | `GET/POST /api/usuarios` |
| Responsável | Meus cadastros | `GET /api/cadastros?usuarioId=` |
| Responsável | Formulário em 4 etapas (aluno, responsáveis, emergência, revisão) | `POST /api/cadastros`, `PUT /api/cadastros/{id}`, `POST /api/cadastros/{id}/enviar`, `GET /api/cadastros/cep/{cep}` |
| Responsável | Detalhe com linha do tempo do status | `GET /api/cadastros/{id}`, `DELETE /api/cadastros/{id}` |
| Funcionário | Fila de triagem | `GET /api/triagem/fila` |
| Funcionário | Detalhe com aprovar / devolver com pendência | `POST /api/triagem/{id}/aprovar`, `POST /api/triagem/{id}/reprovar` |
| Funcionário | Todos os cadastros (contadores, busca, filtro) | `GET /api/cadastros` |
| Funcionário | Exportação (baixa CSV) | `GET /api/exportacao?status=` |

## Organização

```
src/
├── api.ts            ← tipos (iguais ao model da API) e chamadas às rotas
├── contexto.tsx      ← usuário logado e avisos (toasts)
├── utils.ts          ← máscaras, datas, textos de status
├── estilos.css       ← todo o visual (cores no topo do arquivo)
├── components/       ← peças reutilizáveis (layout, campos, badges…)
└── pages/            ← uma tela por arquivo
```

Para mudar as cores, edite as variáveis no começo de `src/estilos.css`.

## Observação

Não há login de verdade: a tela inicial só escolhe "quem está usando" e guarda no navegador.
A API também não tem autenticação ainda.
