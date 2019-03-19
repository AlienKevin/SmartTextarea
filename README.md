# SmartTextarea
A simplistic textarea in browser that supports undo, redo, find, and replace.

## Features
### Find and Replace
1. Find previous occurence
2. Find next occurence
3. Find and replace
4. Replace all

To **activate** the Find and Replace panel, press <kbd>Ctrl+F</kbd>. You can also right click and select "Search" in the context menu to find the selected text. 

To find the **next occurence**, click on the 🡲 (right arrow icon) or press <kbd>Enter</kbd>. To find the **previous occurence**, click on the 🡰 (left arrow icon).

To **find and replace next occurence**, click on the <img src="icons/findAndReplace.svg" width="14px"></img> icon. To **replace all occurences**, click on the <img src="icons/replaceAll.svg" width="14px"></img>

To toggle **match case** when searching, click on the <img src="icons/caseSensitivity.svg" width="14px"></img> icon. To toggle **regular expression** when searching, click on the <img src="icons/useRegex.svg" width="14px"></img> icon.

### Undo and Redo
1. Press <kbd>Ctrl+Z</kbd> to undo
2. Press <kbd>Ctrl+Y</kbd> to redo

Default to save 100 versions in undo/redo history. (you can pass in custom values). Undo/redos are all in whole words as in many other word processors like Microsoft Word. You can also right click nad select "Undo" or "Redo" in the context menu to undo or redo.

## Credits
This project's Find and Replace functionality is based on Jens Fischer's StackOverflow answer on ["Find and Replace for an Textarea"](https://stackoverflow.com/questions/7781099/find-and-replace-for-an-textarea/7781395#7781395).
The Find & Replace, Replace All, and Case Sensitive icons are based on [Visual Studio Code](https://github.com/Microsoft/vscode)'s icons. The design of the find and replace panel is heavily based VS Code's.

## License
This project is licensed under the terms of the MIT license.