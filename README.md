# mpn

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

mpn help - for help
```