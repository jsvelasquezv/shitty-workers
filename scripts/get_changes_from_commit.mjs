#!/usr/bin/env zx
//parameters
const commit_id = process.env.GITHUB_REF_NAME
const folder_level = process.env.FOLDER_LEVEL || 1
const workers_folder = process.env.WORKERS_FOLDER || "services"
let paths_changed = await $`git diff-tree --no-commit-id --name-only --diff-filter=d ${commit_id} -r`
// split the command output
paths_changed = paths_changed.stdout.split("\n")
paths_changed.pop()
let paths_changed_filtered = paths_changed.filter((path)=>( path.indexOf(`${workers_folder}/`) >= 0 ))
// get the folders names and remove duplicated
let changed_folders = paths_changed_filtered.map( (item) => ( `${workers_folder}/${item.split("/")[folder_level]}` ))
const changed_folders_set = new Set(changed_folders)
const json_output = JSON.stringify([...changed_folders_set])
echo`${json_output}`