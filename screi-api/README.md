# API de Cadastro de Alunos (Spring Boot)

API REST em Java 21 + Spring Boot 4, feita a partir do diagrama UML (view / service / model).

## Rodar

```powershell
.\mvnw.cmd spring-boot:run
```

A API sobe em http://localhost:8080. Para parar: `Ctrl + C` no terminal.

- `.\mvnw.cmd test`: roda os testes

## Organização do código (`src/main/java/com/exemplo/api`)

| Pasta        | O que tem |
|--------------|-----------|
| `view`       | Controllers: onde ficam as **rotas** |
| `service`    | Regras de negócio (o que pode ou não pode fazer) |
| `model`      | Entidades do diagrama (viram tabelas no banco) |
| `repository` | Acesso ao banco |

## Fluxo do cadastro

```
RASCUNHO --enviar--> ENVIADO --aprovar--> APROVADO
   ^                    |
   |                 reprovar (com justificativa)
   |                    v
   +----editar----- COM_PENDENCIA --enviar--> ENVIADO ...
```

## Rotas

### Usuários (`/api/usuarios`)
| Método | URL                 | Descrição |
|--------|---------------------|-----------|
| GET    | /api/usuarios       | lista |
| GET    | /api/usuarios/{id}  | busca um |
| POST   | /api/usuarios       | cria: `{ "nome": "Maria", "email": "maria@email.com", "perfil": "RESPONSAVEL" }` |

### Cadastro: usado pelo responsável (`/api/cadastros`)
| Método | URL                          | Descrição |
|--------|------------------------------|-----------|
| POST   | /api/cadastros               | cria o rascunho (precisa de `usuarioId`) |
| PUT    | /api/cadastros/{id}          | salva uma etapa (só os campos enviados são alterados) |
| POST   | /api/cadastros/{id}/enviar   | envia para triagem (confere se está tudo preenchido) |
| GET    | /api/cadastros/{id}/status   | consulta o status |
| GET    | /api/cadastros               | lista (aceita `?usuarioId=1`) |
| GET    | /api/cadastros/{id}          | busca um |
| DELETE | /api/cadastros/{id}          | exclui (só rascunho) |
| GET    | /api/cadastros/cep/{cep}     | busca o endereço no ViaCEP |

Corpo do criar / salvar etapa (todos os blocos são opcionais; mande só a etapa que está salvando):
```json
{
  "usuarioId": 1,
  "aluno": {
    "nome": "João", "dataNascimento": "2018-05-10", "cpf": "12345678900",
    "observacoesSaude": "Alergia a amendoim",
    "endereco": { "cep": "01001000", "logradouro": "Praça da Sé", "bairro": "Sé", "cidade": "São Paulo", "uf": "SP" }
  },
  "responsaveis": [
    { "nome": "Maria", "cpf": "98765432100", "parentesco": "Mãe", "telefone": "11999999999",
      "email": "maria@email.com", "endereco": { "cep": "01001000", "logradouro": "Praça da Sé", "bairro": "Sé", "cidade": "São Paulo", "uf": "SP" } }
  ],
  "contatosEmergencia": [
    { "nome": "Ana", "telefone": "11888888888", "parentesco": "Tia" }
  ]
}
```

### Triagem: usado pelo funcionário (`/api/triagem`)
| Método | URL                          | Descrição |
|--------|------------------------------|-----------|
| GET    | /api/triagem/fila            | cadastros aguardando análise (mais antigos primeiro) |
| POST   | /api/triagem/{id}/aprovar    | aprova |
| POST   | /api/triagem/{id}/reprovar   | devolve com pendência: `{ "justificativa": "..." }` |

### Exportação (`/api/exportacao`)
| Método | URL                                   | Descrição |
|--------|---------------------------------------|-----------|
| GET    | /api/exportacao                       | baixa CSV (abre no Excel) dos aprovados |
| GET    | /api/exportacao?status=ENVIADO        | CSV de outro status |

## Erros

Os erros voltam sempre neste formato:
```json
{ "mensagem": "O cadastro está incompleto", "pendencias": ["responsaveis: informe ao menos um responsável"] }
```
- 400: dados inválidos/incompletos
- 404: não encontrado
- 409: ação não permitida no status atual (ex.: editar um cadastro já enviado)

## Banco de dados

H2 em arquivo (`data`), sem instalar nada. Para ver as tabelas, abra http://localhost:8080/h2-console
(JDBC URL: `jdbc:h2:file:./data/api-db`, usuário `sa`, sem senha).
Para zerar o banco: pare a API e apague a pasta `data`.
