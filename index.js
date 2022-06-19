const redis = require("redis");
const db = redis.createClient({});
const inquirer = require("inquirer");
  const questions = [
    {
      type: "list",
      name: "name",
      choices: [
        "Add a new user",
        "Save a bookwork code",
        "Get a bookwork code",
        "Flush the database"
      ],
      message: "What do you want to do?",
    },
  ];

  inquirer.prompt(questions).then(async(answers) => {
    await db.connect()
    if(answers.name == "Add a new user") {
        const questions = [
            {
                type: "input",
                name: "name",
                message: "Name of user?"
            }
        ]
        inquirer.prompt(questions).then(async(answers) => {
            if(await db.get("names") == null) {
                let arr = [answers.name]
                await db.set("names", JSON.stringify(arr))
            } else {
                let arr = JSON.parse(await db.get("names"))
                arr.push(answers.name)
                await db.set("names", JSON.stringify(arr))
            }
            console.log("User added!")
            process.exit(1)
        })
    } else if(answers.name == "Save a bookwork code") {
        const names = await db.get("names")
        if(names == null) {
            console.log("You need to add a user first!")
            process.exit(1)
        } else if(JSON.parse(names).length == 1) {
            const user = await db.get(`${JSON.parse(names)[0]}_codes`)
            const questions = [
                {
                    type: "input",
                    message: "Enter your bookwork code",
                    name: "code"
                },
                {
                    type: "input",
                    message: "Enter the answer",
                    name: "answer"
                }
            ]
            inquirer.prompt(questions).then(async(answers) => {
                if(user == null) {
                    let arr = []
                    arr.push(answers)
                    await db.set(`${JSON.parse(names)[0]}_codes`, JSON.stringify(arr))
                } else {
                    let arr = JSON.parse(user)
                    arr.push(answers)
                    await db.set(`${JSON.parse(names)[0]}_codes`, JSON.stringify(arr))
                }
                console.log("Code saved!")
                process.exit(1)
            })
        } else {
            const questions = [
                {
                    type: "rawlist",
                    name: "name",
                    message: "Save for user",
                    choices: JSON.parse(names),
                },
                {
                    type: "input",
                    message: "Enter your bookwork code",
                    name: "code"
                },
                {
                    type: "input",
                    message: "Enter the answer",
                    name: "answer"
                }
            ]
            inquirer.prompt(questions).then(async(answers) => {
                const user = await db.get(`${answers.name}_codes`)
                if(user == null) {
                    let arr = []
                    arr.push({
                        code: answers.code,
                        answer: answers.answer
                    })
                    await db.set(`${answers.name}_codes`, JSON.stringify(arr))
                } else {
                    let arr = JSON.parse(user)
                    arr.push({
                        code: answers.code,
                        answer: answers.answer
                    })
                    await db.set(`${answers.name}_codes`, JSON.stringify(arr))
                }
                console.log("Code saved!")
                process.exit(1)
            })
        }
    } else if(answers.name == "Get a bookwork code") {
        const names = await db.get("names")
        if(names == null) {
            console.log("You need to add a user first!")
            process.exit(1)
        } else {
            if(JSON.parse(names).length !== 1) {
            const questions = [
                {
                    type: "rawlist",
                    name: "name",
                    message: "Get a code for user",
                    choices: JSON.parse(names),
                }
            ]
            inquirer.prompt(questions).then(async(answers) => {
                const user = await db.get(`${answers.name}_codes`)
               if(user == null) return console.log("No codes saved!")
                const codes = JSON.parse(user)
                const questions = [
                    {
                        type: "input",
                        message: "Enter bookwork code",
                        name: "code"
                    }
                ]
                inquirer.prompt(questions).then(async(answers) => {
                    await codes.find((code) => {
                        if(code.code == answers.code.toUpperCase()) {
                            console.log(`The answer is ${code.answer}`)
                            process.exit(1)
                        } else {
                            console.log("Code not saved!")
                            process.exit(1)
                        }
                    })
                })
            })
        } else {
            const user = await db.get(`${JSON.parse(names)[0]}_codes`)
               if(user == null) return console.log("No codes saved!")
                const codes = JSON.parse(user)
                const questions = [
                    {
                        type: "input",
                        message: "Enter bookwork code",
                        name: "code"
                    }
                ]
                inquirer.prompt(questions).then(async(answers) => {
                    await codes.find((code) => {
                        if(code.code == answers.code.toUpperCase()) {
                            console.log(`The answer is ${code.answer}`)
                            process.exit(1)
                        } else {
                            console.log("Code not saved!")
                            process.exit(1)
                        }
                    })
                })
        }
    }
    } else if(answers.name == "Flush the database") {
        inquirer.prompt([
            {
                type: "confirm",
                name: "confirm",
                message: "Are you sure you want to flush the database?"
            }
        ]).then(async(answers) => {
            if(answers.confirm) {
                await db.flushDb()
                console.log("Database flushed!")
                process.exit(1)
            } else {
                console.log("Action cancelled!")
                process.exit(1)
            }
        })
    }
  });
