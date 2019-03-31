# SmartTextarea
A simplistic textarea in browser that supports undo, redo, find, and replace.

## Features
### Find and Replace
1. Find previous occurence
2. Find next occurence
3. Find and replace
4. Replace all

To **activate** the Find and Replace panel, press <kbd>Ctrl+F</kbd>. 

To find the **next occurence**, click on the 🡲 (right arrow icon) or press <kbd>Enter</kbd>. To find the **previous occurence**, click on the 🡰 (left arrow icon).

To **find and replace next occurence**, click on the <img src="https://raw.github.com/AlienKevin/SmartTextarea/master/icons/findAndReplace.svg?sanitize=true" width="14px"></img> icon. To **replace all occurences**, click on the <img src="https://raw.github.com/AlienKevin/SmartTextarea/master/icons/replaceAll.svg?sanitize=true" width="14px"></img>

To toggle **match case** when searching, click on the <img src="https://raw.github.com/AlienKevin/SmartTextarea/master/icons/caseSensitivity.svg?sanitize=true" width="14px"></img> icon. To toggle **regular expression** when searching, click on the <img src="https://raw.github.com/AlienKevin/SmartTextarea/master/icons/useRegex.svg?sanitize=true" width="14px"></img> icon. To toggle **match whole word** when searching, click on the <img src="https://raw.github.com/AlienKevin/SmartTextarea/master/icons/wholeWord.svg?sanitize=true" width="14px"></img> icon.

### Undo and Redo
1. Press <kbd>Ctrl+Z</kbd> to undo
2. Press <kbd>Ctrl+Y</kbd> to redo

Default to save 100 versions in undo/redo history. (you can pass in custom values). Undo/redos are all in whole words as in many other word processors like Microsoft Word.

## Installation

### NPM
`npm install smart-textarea`

### CDN
Add the below imports in your html
1. jsDelivr
```
<html>
<head>
...
<link href="https://cdn.jsdelivr.net/npm/smart-textarea@latest/dist/main.css" rel="stylesheet">
</head>
<body>
...
<script src="https://cdn.jsdelivr.net/npm/smart-textarea@latest/dist/bundle.js"></script>
<script>
    // Convert textareas to smartTextareas here
    // See the Usage example below
</script>
</body>
</html>
```
2. Unpkg:
```
<html>
<head>
...
<link href="https://unpkg.com/smart-textarea@latest/dist/main.css" rel="stylesheet">
</head>
<body>
...
<script src="https://unpkg.com/smart-textarea@latest/dist/bundle.js"></script>
<script>
    // Convert textareas to smartTextareas here
    // See the Usage example below
</script>
</body>
</html>
```

## Usage
The simplest way is to import the compressed and bundled JS and CSS files directly in your HTML file.

```
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>
        Smart Textarea Test
    </title>

    <!--Load stylesheet for the find & replace box and context menu-->
    <link rel="stylesheet" href="node_modules/smart-textarea/dist/main.css">

<body>
    <textarea id="textarea1">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    </textarea>

    <!--You can have more than one smartTextarea. They will all function independently-->
    <textarea id="textarea2">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
    </textarea>

    <!--Load script file for smartTextarea-->
    <script src="node_modules/smart-textarea/dist/bundle.js"></script>

    <!--Convert a normal textarea to a smartTextarea-->
    <script>
        const smartTextarea1 = new SmartTextarea(document.getElementById("textarea1"));
        const smartTextarea2 = new SmartTextarea(document.getElementById("textarea2"));
    </script>
</html>
```

## Update
Because of the usual 24-hour cache by CDN providers, you should replace the @latest tag with @(the latest version number) for immediate update to the latest version. It's always the safest to use the current stable version @1.0.9.

## Credits
This project's Find and Replace functionality is based on Jens Fischer's StackOverflow answer on ["Find and Replace for an Textarea"](https://stackoverflow.com/questions/7781099/find-and-replace-for-an-textarea/7781395#7781395).
The Find & Replace, Replace All, and Case Sensitive icons are based on [Visual Studio Code](https://github.com/Microsoft/vscode)'s icons. The design of the find and replace panel is heavily based VS Code's.

## License
This project is licensed under the terms of the MIT license.