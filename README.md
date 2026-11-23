# SCREI — Sistema de Cadastro e Rematrícula da Educação Infantil

O SCREI organiza o cadastro e a rematrícula de alunos da Educação Infantil em um fluxo digital.  
Responsáveis preenchem os dados do aluno e da família em etapas.  
A secretaria recebe as solicitações em uma fila para conferência e aprovação ou devolução com pendências.  
A proposta é reduzir a digitação manual, facilitar o acompanhamento dos cadastros e consolidar os dados para exportação.

**Disciplina:** Programação Orientada a Objetos Avançada (POOA)  
**Semestre:** 2026.2  
**Turma:** BES - quinta-feira, noturno  
**Professor:** Mario Jorge Pereira  
**Equipe:** Caiane Santos, Luiz Vasconcelos, Mariana Conceição, Paulo Vitor e Yuane Miranda

---

## Problema, público-alvo e proposta de valor

Durante o período de cadastro e rematrícula, o preenchimento manual pode sobrecarregar a secretaria escolar, gerar filas, atrasos e inconsistências nos dados.

O sistema atende a dois públicos: responsáveis pelos alunos, que preenchem e acompanham as solicitações, e funcionários da secretaria, que conferem os dados e fazem a triagem.

A proposta de valor é centralizar o preenchimento, a análise e o acompanhamento em um sistema web, com formulários por etapas, atualização de status e exportação dos cadastros em XLSX.

---

## Tecnologias e justificativas

- **Java 21 e Spring Boot 4.1.2:** usados na API para organizar rotas, regras de negócio e acesso aos dados em camadas. Essa separação ajuda a manter o fluxo de cadastro e triagem organizado.
- **Spring Data JPA e Hibernate:** fazem o mapeamento entre as entidades Java e o banco relacional, reduzindo código repetido de acesso aos dados.
- **Spring Security:** protege as rotas da API conforme o perfil do usuário. A segurança ainda tem limitações descritas abaixo.
- **H2:** banco em arquivo escolhido para facilitar a execução local do MVP sem instalar ou configurar um servidor de banco de dados.
- **React 19.3.1 e TypeScript 7.0.2:** usados para construir a interface web e representar os dados da API com tipos, facilitando a manutenção do front-end.
- **Vite 8.3.8:** usado para iniciar e compilar a aplicação web durante o desenvolvimento.
- **Apache POI 5.2.5:** gera a planilha Excel no formato XLSX.
- **ViaCEP:** consulta endereços a partir do CEP e ajuda a preencher os campos de endereço.
- **Strategy e Factory:** aplicados na estrutura de exportação para separar os formatos de arquivo e selecionar o exportador correspondente.

---

## Estrutura do projeto

```text
Escola_POOA/
├── screi-api/
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/exemplo/api/
│       │   ├── model/       # Entidades e enums
│       │   ├── repository/  # Acesso ao banco
│       │   ├── service/     # Regras de negócio
│       │   └── view/        # Controladores e rotas REST
│       └── test/            # Testes automatizados da API
├── screi-front/
│   ├── package.json
│   └── src/
│       ├── components/      # Componentes reutilizáveis
│       └── pages/           # Telas do sistema
└── README.md
```

---

## Pré-requisitos

- Java 21 ou superior.
- Node.js 20.19 ou superior, ou 22.12 ou superior, e npm. Essas versões atendem ao requisito do Vite 8; consulte o [guia oficial do Vite](https://v8.vite.dev/guide/).
- Acesso à internet na primeira instalação das dependências e para consultar o ViaCEP.
- O Maven Wrapper já está incluído na pasta `screi-api`; não é necessário instalar o Maven separadamente.

As versões das dependências estão registradas em `screi-api/pom.xml`, `screi-front/package.json` e `screi-front/package-lock.json`.

---

## Instalação e execução

Execute os comandos em terminais separados, a partir da pasta raiz do projeto.

### 1. Iniciar a API

```powershell
cd screi-api
.\mvnw.cmd spring-boot:run
```

A API ficará disponível em `http://localhost:8080`.

O console do H2 fica em `http://localhost:8080/h2-console`.

- **JDBC URL:** `jdbc:h2:file:./data/api-db`
- **Usuário:** `sa`
- **Senha:** em branco

### 2. Iniciar o front-end

Em outro terminal:

```powershell
cd screi-front
npm install
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://localhost:5173`. O front-end usa o proxy configurado em `vite.config.ts` para encaminhar chamadas `/api` à API na porta 8080.

---

## Dados e contas de demonstração

Não há contas de demonstração pré-cadastradas. Antes de apresentar o sistema, crie duas contas pela opção **Criar nova conta**, usando dados fictícios:

| Perfil | E-mail sugerido | Senha sugerida |
|---|---|---|
| Responsável | `responsavel.demo@example.com` | `Demo@SCREI2026` |
| Funcionário | `secretaria.demo@example.com` | `Demo@SCREI2026` |

As contas acima são apenas exemplos: precisam ser criadas no sistema antes do uso. Se já existirem no banco local, use outros e-mails fictícios.

Use dados sintéticos para alunos e responsáveis. Não use CPFs, endereços, telefones ou outros dados pessoais reais na demonstração.

---

## Como executar os testes

### Testes automatizados da API

```powershell
cd screi-api
.\mvnw.cmd test
```

Os testes da API usam banco H2 em memória.

### Verificação de compilação do front-end

```powershell
cd screi-front
npm run build
```

Esse comando verifica os tipos TypeScript e compila o front-end. O projeto não tem uma suíte automatizada de testes comportamentais do front-end configurada.

---

## Roteiro para demonstrar o fluxo principal

1. Inicie a API e o front-end.
2. Entre com a conta fictícia de responsável.
3. Crie um cadastro e preencha as etapas de dados do aluno, responsáveis e contatos de emergência.
4. Envie o cadastro para a secretaria.
5. Saia e entre com a conta fictícia de funcionário.
6. Abra a fila de triagem e confira os dados enviados.
7. Aprove o cadastro ou devolva-o com uma justificativa.
8. Entre novamente como responsável e confira o status e, se houver, a justificativa da pendência.
9. Como funcionário, abra a tela de exportação, baixe a planilha XLSX e confira se os dados esperados aparecem nela.

---

## Limitações conhecidas e próximos passos

- **Verificação de CPF:** não há integração com uma API ou base oficial para confirmar autenticidade ou titularidade. A validação local não substitui essa consulta.
- **Segurança dos dados:** as senhas são armazenadas com hash BCrypt, mas os demais dados cadastrais não têm criptografia própria no banco. A execução local também usa HTTP, sem HTTPS.
- **Perfis de acesso:** no protótipo, a tela de criação de conta permite escolher o perfil de funcionário. Isso deve ser restringido antes de qualquer uso real.
- **ViaCEP:** a consulta de endereço depende de internet e da disponibilidade do serviço externo.
- **Testes do front-end:** ainda não há testes automatizados comportamentais para a interface.
- **Exportação:** o teste de integração da API confirma que a rota responde com sucesso; a conferência do conteúdo da planilha deve ser feita pelo roteiro de demonstração.

Como próximos passos, a equipe pode avaliar uma forma autorizada de verificar CPFs, reforçar a proteção dos dados e dos perfis de acesso e acrescentar testes automatizados para o front-end e para o conteúdo exportado.

---

## Fontes, licenças e componentes de terceiros

| Componente ou serviço | Uso no projeto | Licença ou fonte |
|---|---|---|
| Spring Boot 4.1.2 | API e aplicação web Java | [Apache License 2.0](https://github.com/spring-projects/spring-boot/blob/main/LICENSE.txt) |
| Apache POI 5.2.5 | Geração de arquivos XLSX | [Apache License 2.0](https://poi.apache.org/legal.html) |
| H2 | Banco de dados local | [MPL 2.0 ou EPL 1.0](https://h2database.com/html/license.html) |
| React 19.3.1, React DOM 19.3.1, React Router 7.18.5 e Vite 8.3.8 | Interface web | [MIT — React](https://github.com/facebook/react/blob/main/LICENSE), [MIT — React Router](https://github.com/remix-run/react-router/blob/main/LICENSE.md), [MIT — Vite](https://github.com/vitejs/vite/blob/main/LICENSE) |
| TypeScript 7.0.2 | Tipagem do front-end | [Apache License 2.0](https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt) |
| ViaCEP | Consulta de endereço pelo CEP | [Serviço ViaCEP e avisos de uso](https://viacep.com.br/) |

O ViaCEP é um serviço externo consultado pelo sistema; não é distribuído junto com o código. O site do serviço alerta que o uso massivo pode bloquear consultas.

As versões e demais dependências diretas estão declaradas em `pom.xml`, `package.json` e `package-lock.json`. Dependências transitivas mantêm as licenças próprias de seus projetos.

O repositório não declara uma licença própria para redistribuição do código original da equipe.

### Uso de inteligência artificial

Foram utilizadas as ferramentas **Gemini**, **GitHub Copilot** e **Antigravity** como apoio durante o desenvolvimento do projeto. A equipe é responsável por revisar e validar o conteúdo incorporado ao sistema. O detalhamento das atividades e das partes afetadas deve constar também na declaração obrigatória do Anexo E.
