# Sistema de Automatrícula — Ensino Infantil

## Contexto

O processo de rematrícula e cadastro de novos alunos no ensino infantil enfrenta um gargalo operacional na secretaria escolar. A digitação manual de dados cadastrais consome tempo excessivo dos funcionários, gera filas de atendimento e aumenta o risco de erros nas informações armazenadas.

## Solução

Aplicação web focada no autosserviço de matrícula. O sistema descentraliza a entrada de dados, transferindo a etapa de preenchimento diretamente para os responsáveis técnicos pelo aluno.

## Escopo Funcional do Sistema

### Módulo do Responsável

- **Formulário Guiado por Etapas**: estruturação do preenchimento dividindo a coleta em blocos lógicos — dados do aluno, dados dos responsáveis e contatos de emergência.
- **Acompanhamento de Status**: consulta ao estado atual do processo de cadastro (ex.: "Enviado", "Em Análise", "Aprovado" ou "Com Pendência").

### Módulo da Secretaria

- **Fila de Triagem**: centralização das solicitações recebidas para validação e conferência dos dados cadastrais preenchidos.
- **Fluxo de Aprovação e Reprovação**: regra de negócio para aceite ou rejeição das informações, com registro obrigatório de justificativa em caso de inconsistência nos dados.
- **Exportação de Dados**: extração e geração dos dados cadastrais consolidados em formato XLSX.
# Escola_POOA