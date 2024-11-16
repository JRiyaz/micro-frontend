# Change default package manager for Angular

```sh
ng config -g cli.packageManager pnpm
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

user/* => user/frontend/*

```sh
cd projects/user && mkdir frontend && mv public/ src/ tsconfig.* frontend/
```
Check if there are any other files or folders has not moved to frontend directory except .git folder. Leave the .git folder in same place., don't move it.
## Update the location

    1. /user/src to /user/frontend/src in angular.json
    2. update extends and outDir property path in (user application) tsconfig.app.json and tsconfig.spec.json files
        "extends": "../../tsconfig.json", ==> "extends": "../../../tsconfig.json",
        "outDir": "../../out-tsc/app", ==> "outDir": "../../../out-tsc/app
