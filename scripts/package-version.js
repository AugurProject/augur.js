var exec = require("child_process").exec;

exec("npm -j ls " + process.argv[2], function (error, stdout) {

  try {
    if (!error) {
      var info = JSON.parse(stdout);
      if (info && info.dependencies && info.dependencies[process.argv[2]]) {
        console.log(info.dependencies[process.argv[2]].version);
        process.exit(0);
      }
    }
  } catch (e) {
    console.error(e);
  }

  console.error("Could not read version");
  process.exit(1);
});
