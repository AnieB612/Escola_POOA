# SCREI — Sistema de Cadastro e Rematrícula da Educação Infantil

Projeto desenvolvido para a disciplina de **Programação Orientada a Objetos Avançada (POOA)** — Semestre 2026.2.  
**Equipe:** Caiane Santos, Luiz Vasconcelos, Mariana Conceição, Paulo Vitor, Yuane Miranda  
**Professor:** Mario Jorge Pereira

---

## 1. Visão Geral e Arquitetura

O sistema adota uma **Arquitetura Monolítica em Camadas (Layered Architecture)** com divisão clara de responsabilidades:

1. **Camada de Apresentação (Frontend Node.js / React)**:
   - Interface Web responsiva (Mobile, Tablet, Desktop) [RNF004].
   - Formulário em Etapas (Wizard) para o responsável (RF001 a RF004).
   - Autocompletar assíncrono de endereços via integração com API ViaCEP.
   - Painel da Secretaria com fila de triagem (RF007, RF008) e exportação em XLSX (RF013).

2. **Camada de Aplicação e Negócio (Backend Java 21 + Spring Boot 4)**:
   - Controladores REST (`view` / `controller`): `CadastroController`, `TriagemController`, `ExportacaoController`, `UsuarioController`.
   - Serviços de Domínio (`service`): `CadastroService`, `TriagemService`, `ExportacaoService`, `ViaCepService`.
   - Mecanismo de Exportação em Excel (`Exportador` e `ExportadorXlsx` com Apache POI) para geração de planilhas `.xlsx`.
   - Segurança e Perfis de Acesso (`RESPONSAVEL` e `FUNCIONARIO`).

3. **Camada de Persistência**:
   - Spring Data JPA com Hibernate e banco relacional H2 / PostgreSQL.
   - Entidades de domínio: `Cadastro`, `Aluno`, `Responsavel`, `ContatoEmergencia`, `Endereco`, `Usuario`.

---

## 2. Estrutura do Projeto

```
Escola_POOA/
├── screi-api/                     # Backend Java 21 + Spring Boot (API REST)
│   ├── pom.xml                    # Dependências Maven (Spring Boot, JPA, H2, Apache POI)
│   └── src/main/java/com/exemplo/api/
│       ├── model/                 # Entidades e Enums (Cadastro, Aluno, Endereco, etc.)
│       ├── repository/            # Repositórios JPA (CadastroRepository, etc.)
│       ├── service/               # Regras de negócio e Exportação (CadastroService, ViaCepService, ExportadorXlsx, etc.)
│       └── view/                  # Controllers HTTP REST (CadastroController, TriagemController, etc.)
├── screi-front/                   # Frontend SPA (React + TypeScript + Vite)
│   ├── package.json
│   └── src/
│       ├── components/            # Componentes reutilizáveis (CamposEndereco com ViaCEP, Wizard, etc.)
│       ├── pages/                 # Telas (CadastroFormulario, TriagemFila, Exportacao, etc.)
│       └── api.ts                 # Cliente HTTP e integração com a API REST
├── .gitignore                     # Proteção contra pastas compiladas, node_modules e banco local
└── README.md
```

---

## 3. Como Executar

### 3.1. Rodando a API (Backend)

Requisitos: Java 21+ instalado.

1. Acesse o diretório da API:
   ```powershell
   cd screi-api
   ```
2. Inicie a aplicação com o Maven Wrapper:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
   A API estará disponível em: `http://localhost:8080`.  
   Console do H2: `http://localhost:8080/h2-console`.

### 3.2. Rodando o Frontend (Node.js)

Requisitos: Node.js 18+ instalado.

1. Acesse o diretório do frontend:
   ```powershell
   cd screi-front
   ```
2. Instale as dependências (apenas na primeira vez):
   ```powershell
   npm install
   ```
3. Inicie o servidor de desenvolvimento:
   ```powershell
   npm run dev
   ```
4. Abra o navegador no endereço exibido (geralmente `http://localhost:5173`). O Vite já possui proxy configurado para redirecionar as chamadas `/api` automaticamente para a porta 8080.
