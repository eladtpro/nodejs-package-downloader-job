import { PathLike } from "fs";
import { join as pathJoin } from "path";


export function join(path: PathLike,  ...paths: string[]): PathLike{
    return pathJoin(path.toString(), ...paths);
}
