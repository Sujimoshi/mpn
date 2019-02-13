# mpn

## Quick start

### Install
```
npm i -g mpn.cli
```

### Usage
```sh
cd ~/Projects/example # go to project root
mpn link ~/Projects/example-module # link example-module to current package
mpn start # choose scripts to run dev process or simply use "npm run ..."

# Or you can use autoresolve module

mpn config set resolve=~/Projects 
cd ~/Projects/example
mpn link example-module # now folder path resolves automaticaly
mpn start
```

## List of available commands
```
mpn link [package_name_or_path] - Link package to current
      -l - List all linked packages

mpn unlink [package_name_or_path|--all] - Unlink package from current
  --all - unlink all

mpn start - Run build process in current package and all linked packages.

mpn deps-diff path_to_package [path_to_package - default to 'CWD'] - Get dependencies difference between given packages.

mpn config [get|set] [path][=value]
  Available options:
  - resolve - Path to folder(s) where mpn will looks for modules by names

mpn pack [package_name_or_path] - Pack and install package as file

mpn completion [setup|cleanup] - initialize completion
  - Support 'zsh', 'bash', 'fish'
  - Requires 'bash-completion' package for bash
  - For 'bash' users on MacOS see https://davidalger.com/posts/bash-completion-on-os-x-with-brew/

mpn help - for help
```