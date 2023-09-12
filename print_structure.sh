#!/bin/bash

print_folder_recurse() {
    for full_path in "$1"/*; do
        [ -e "$full_path" ] || continue # if file doesn't exist, skip it
        local item_name=$(basename "$full_path")
        
        # Skip the contents of the node_modules folder
        if [ "$item_name" = "node_modules" ]; then
            printf '%*s%s (contents skipped)\n' $(( 2 * $2 )) '' "$item_name"
            continue
        fi

        printf '%*s%s\n' $(( 2 * $2 )) '' "$item_name"
        
        if [ -d "$full_path" ]; then
            print_folder_recurse "$full_path" $(($2 + 1))
        fi
    done
}

root_folder="./src"
print_folder_recurse $root_folder 0
