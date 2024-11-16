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
