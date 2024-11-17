# Change default package manager for Angular

```sh
ng config -g cli.packageManager pnpm
```

# Edit .editorconfig file and add the following

```apacheconf
# Editor configuration, see https://editorconfig.org
root = true

[*]
charset = utf-8
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.{js,jsx,ts,tsx,vue}]
quote_type = single
ij_typescript_use_double_quotes = false
ij_typescript_spaces_within_imports = true

[*.md]
max_line_length = off
trim_trailing_whitespace = false
```

# Angular CLI version used

18.2.12

# Create micro-services using ng command

```sh
ng new name-of-service --no-create-application
```

# Create shell applications

```sh
ng generate application shell --standalone -s -t --skip-tests --style=css --ssr=N
```

```sh
cd projects/shell && git init && git add . && git commit -m "Initial commit"
```

```sh
cd ../.. && git submodule add -b main https://github.com/JRiyaz/inventory-shell.git projects/shell
```

# Create user application

```sh
ng generate application user --standalone -s -t --skip-tests --style=css --ssr=N
```

```sh
cd projects/user && git init && git add . && git commit -m "Initial commit"
```

```sh
cd ../.. && git submodule add -b main https://github.com/JRiyaz/inventory-user.git projects/user
```

# Change directory structure for required application [user]

## move user/src directory inside user/frontend/src directory

user/_ => user/frontend/_

```sh
cd projects/user && mkdir frontend && mv public/ src/ tsconfig.* frontend/
```

Check if there are any other files or folders has not moved to frontend directory except .git folder. Leave the .git folder in same place., don't move it.

## Update the location

    1. /user/src to /user/frontend/src in angular.json
    2. update extends and outDir property path in (user application) tsconfig.app.json and tsconfig.spec.json files
        "extends": "../../tsconfig.json", ==> "extends": "../../../tsconfig.json",
        "outDir": "../../out-tsc/app", ==> "outDir": "../../../out-tsc/app

# Create start command for individual applications in (package.json)

```sh
pnpm start:shell

or

ng serve shell
```

```sh
pnpm start:user

or

ng serve user
```

# Create Run All command in (package.json) using concurrently

```sh
pnpm add -D concurrently
```

```sh
pnpm run:all (or) pnpm start:all
```

# Add Native Federation

```sh
pnpm add @angular-architects/native-federation
```

# Initialize Native Federation in shell app as dynamic-host

```sh
ng g @angular-architects/native-federation:init --project shell --port 4200 --type dynamic-host
```

# Initialize Native Federation in user app as remote

```sh
ng g @angular-architects/native-federation:init --project user --port 4210 --type remote
```

change name from `user` to `user-app` under user application in federation.config.js file

```json
name: 'user-app',
```

Also move `federation.config.js` file inside frontend folder, if it got created outside while initializing federation.

# Change the port of user app in shell app in projects\shell\public\federation.manifest.json file

```json
{
  "user-app": "http://localhost:4210/remoteEntry.json"
}
```

# Enable Zone-less

File: src/app/app.config.ts

```js
import { ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [provideExperimentalZonelessChangeDetection(), provideRouter(routes)]
};
```

Remove zone.js in angular.json file and uninstall zone.js

```sh
pnpm remove zone.js
```

# Add Husky (Husky improves your commits and more 🐶 woof!)

```sh
npx husky-init && pnpm install && pnpm dlx husky-init
```

Add submodule-husky-hook-path.sh file, .prettierignore and modify .husky/pre-commit file and run below command.

Use below command to bypassed husky hook (--no-verify or -n)

```sh
git commit -m "<message>" -n
```

# Add Bootstrap

```sh
pnpm add bootstrap@latest
```

Add bootstrap css and js files in angular.json file

```json
"options": {
    "styles": [
        "projects/shell/src/styles.css",
        "node_modules/bootstrap/dist/css/bootstrap.css"
    ],
    "scripts": [
        "node_modules/bootstrap/dist/js/bootstrap.bundle.js"
    ]
}
```

# Create a shared library

```sh
ng g library shared-ui --standalone
```
