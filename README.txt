# Web and Vision: Teaching Materials
Here are some web-based implementations of some fundamental concepts and algorithms in computer vision, all implemented directly in Typescript, without libraries. 

## Build instructions
The project is already compiled and ready for use, but if you wish to recompile the project, make sure you have Typescript and multi-browserify installed, navigate to the root folder of the project and execute the command:

```
    tsc -p tsconfig.json
```

followed by:

```
    multi-browserify -i js/entry -o js/bundles
```