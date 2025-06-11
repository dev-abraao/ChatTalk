# ChatTalk

ChatTalk é uma solução para conversas em grupo e compartilhamento de mensagens, inspirado pelos antigos chats da UOL, bastante popular no Brasil.


## Funcionalidades do ChatTalk

- 👤 Criação de perfil personalizável pelo usuário
- 📨 Envio de mensagens em tempo-real
- 📸 Compartilhamento de imagens e vídeos
- 👯‍♂️ Criação de salas com tópicos diversos

## Tecnologias utilizadas para desenvolvimento do projeto

#### Next.js
- O [Next](https://nextjs.org/) é um framework full-stack robusto para ambientes Node, o front-end e o back-end foram desenvolvidos numa só codebase, o que simplifica o desenvolvimento em projetos menores
as funcionalidades do Next.js são diversas, mas as que mais tomamos proveito foi o roteamento do app router, renderização do lado do servidor(SSR) para melhoria na performance e segurança do código, e por fim mas não menos importante, a configuração do tailwind para estilização e do typescript para tipagem.

#### Prisma com PostgreSQL
- O [Prisma](https://www.prisma.io/) foi a tecnologia utilizada para simplificação e melhoria nas consultas e criação de modelos relacionais do banco de dados escolhido que neste caso foi o PostgreSQL.

#### Ably SDK 
- O [Ably](https://ably.com/) é um SDK (Software Development Kit) para comunicação via websocket, basicamente a "base" da nossa lógica de comunicação das mensagens são implementados pela funções do Ably.

#### Tailwind CSS
- O [Tailwind](https://tailwindcss.com/) é o framework de estilização mais famoso do mundo, muito útil para "limpar" a codebase de vários arquivos CSS, e na facilidade de estilização dos componentes react.
 
#### JWT para autenticação
- O [JWT](https://jwt.io/) foi utilizado para autorização dos usuários, quando uma sessão é criada um payload criptografado é enviado para o cookie contendo alguns dados importantes para verificação do usuário conectado.

## Como rodar o projeto localmente

### Clone do repositório

Abra o GIT Bash na pasta que você deseja clonar o repositório na sua máquina e cole o seguinte comando.
```
git clone https://github.com/dev-abraao/ChatTalk.git
```

### Instalar dependências do node

Após o projeto estiver clonado, abra o terminal na pasta do projeto e instale as dependências utilizando o comando abaixo.
```
npm install
```

### Gerar o client do Prisma(ORM)
```
npx prisma generate
```

### Conexão do banco de dados
A partir daqui o projeto já estará rodando, mas sem um banco de dados conectado, impossibilitando consultas SQL, você poderá fazer alterações no arquivo schema.prisma(código abaixo) para conexão do seu proprio banco de dados

#### prisma\schema.prisma
```
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
Caso tenha um banco de dados PostgresSQL, crie uma .env e utilize este modelo para conexão do banco de dados.
#### .env
```
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
```
- johndoe = usuário
- randompassword = senha do usuário
- localhost:5432 = porta do banco de dados
- mydb = nome do banco de dados

### Aplicar as migrações do prisma
Após o banco de dados estar conectado, você precisará rodar as migrations para criação das tabelas no seu ambiente local de desenvolvimento, para isso rode o comando abaixo no terminal.

```
npx prisma migrate
```

Após este comando a aplicação deverá estar rodando normalmente na sua máquina, espero que goste da experiência ;)
