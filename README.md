# trilobyte
## Project Setup
```sh
# clone from github and then inside the project folder
npm install #installs dependecies listed in package.json
firebase init #initialize a firebase project in this dir
# use onlyhosting and say no to singlepage app and any options which overwrite existing files
```

### Compile and Hot-Reload for Development

```sh
npm run dev 
```

### Compile and Deploy

```sh
npm run build
firebase deploy --only hosting 
```

## When developing
Static html and css files go into /public
The index.html file must go in the project folder (trilobyte)
Vue components/pages go into src/components
Vue assets go into src/assets