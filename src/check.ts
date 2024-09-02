import * as core from "@actions/core";
import * as exec from "@actions/exec";
import stringArgv from "string-argv";

interface Output {
  name: string;
  mismatches: Mismatch[];
}

interface Result {
  path: string;
  mismatch: Mismatch;
}

interface Mismatch {
  original_begin_line: number;
  original_end_line: number;
  expected_begin_line: number;
  expected_end_line: number;
  original: string;
  expected: string;
}

const check = async (
  args: string = core.getInput("args"),
  rustfmt_args: string = core.getInput("rustfmt-args"),
): Promise<Result[]> => {
  let buffer = "";
  return exec
    .exec(
      "cargo",
      ["fmt"]
        .concat(stringArgv(args))
        .concat(["--", "--emit", "json"].concat(stringArgv(rustfmt_args))),
      {
        listeners: {
          stdout: (data: Buffer) => {
            buffer += data.toString().trim();
          },
        },
        cwd: core.getInput("working-directory")
      },
    )
    .then(() =>
      JSON.parse(buffer).flatMap((output: Output) =>
        output.mismatches.map((mismatch) => ({
          path: output.name,
          mismatch,
        })),
      ),
    );
};

export default check;
