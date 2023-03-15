const decodeFormula = (formula) => {
    let arr = formula.split('')
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === '-' && arr[i + 1] === '>') {
            arr[i] = '->'
            arr.splice(i + 1, 1)
        }
        let j = i + 1
        let tmp = ''
        while (!!Number(arr[j])) {
            tmp += arr[j]
            j++
        }

        if (arr[i] !== '(' && arr[i] !== '!' && arr[i] !== '*' && arr[i] !== '+') {
            arr[i] += tmp
            arr.splice(i + 1, tmp.length)
        }
    }
    return arr
}

let getPriority = (operator) => {
    if (operator === '!') {
        return 6
    } else if (operator === '*') {
        return 5
    } else if (operator === '+') {
        return 4
    } else if(operator === '~') {
        return 2
    } else if (operator === '->') {
        return 3
    } else {
        return 1
    }
}

const checkOnSign = (element) => {
    let signs = ['!', '*', '+', '->', '(', ')', '~']
    if (signs.indexOf(element) !== -1) {
        return true
    } else {
        return false
    }
}

const Conjuction = (a, b) => {
    a = Number(a)
    b = Number(b)
    return a && b
}

const Disjuction = (a, b) => {
    a = Number(a)
    b = Number(b)
    return a || b
}

const Invertion = (a) => {
    return Number(!Number(a))
}

const Implication = (a, b) => {
    if (Number(a) && Number(!Number(b))) {
        return false
    } else {
        return true
    }
}

const Equivalence = (a, b) => {
    return a == b
}

const BinaryOperWithoutInversion = (variables, sign) => {
    let a = variables.pop()
    let b = variables.pop()

    if (sign === '*') {
        return Conjuction(a, b)
    } else if (sign === '+') {
        return Disjuction(a, b)
    } else if (sign === '->') {
        return Implication(b, a)
    } else {
        return Equivalence(a, b)
    }
}

const BinaryOperWithInversion = (variables, sign) => {
    if (sign === '!') {
        return Number(Invertion(variables.pop()))
    } else {
        return Number(BinaryOperWithoutInversion(variables, sign))
    }
}

const calculate = (formula, variables, signs) => {
    let stackVariables = []
    let stackSigns = []
    for (let el of formula) {
        if (variables.includes(el)) {
            stackVariables.push(el)
        } else if (el === '(') {
            stackSigns.push(el)
        } else if (el === ')') {
            while (stackSigns[stackSigns.length - 1] !== '(') {
                stackVariables.push(BinaryOperWithInversion(stackVariables, stackSigns.pop()))
            }
            stackSigns.pop()
        }else if (signs.includes(el)) {
            while (stackSigns.length > 0 && getPriority(stackSigns[stackSigns.length - 1]) >= getPriority(el)) {
                stackVariables.push(BinaryOperWithInversion(stackVariables, stackSigns.pop()))
            }
            stackSigns.push(el)
        }
    }
    while (stackSigns.length !== 0) {
        stackVariables.push(BinaryOperWithInversion(stackVariables, stackSigns.pop()))
    }
    return stackVariables.pop()
}

const buildStacks = (stackVariables, stackSigns, decodedFormula) => {
    for (let el of decodedFormula) {
        if (checkOnSign(el)) {
            stackSigns.push(el)
        } else {
            stackVariables.push(el)
        }
    }
    let newSet = new Set(stackVariables) //Создаем множество, для того чтобы каждый элемент встречался ровно 1 раз

    stackVariables = Array.from(newSet)

    return stackVariables
}

function truthTable(n) {
    const rows = 2 ** n;
    const table = [];

    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = n - 1; j >= 0; j--) {
            row.push((i >> j) & 1);
        }
        table.push(row);
    }

    return table;
}

const buildTable = (n) => {
    const table = truthTable(n);
    return table
}


let buildAnswers = (formula, stackSigns, stackVariables, table) => {
    let answers = []
    for(let row of table) {
        let formulaWithNumbers = replaceVariables(formula, row, stackVariables)
        let ans = calculate(formulaWithNumbers, row.map(el => `${el}`), stackSigns)
        answers.push(ans)
    }
    return answers
}

const replaceVariables = (formula, row, variables) => {
    let ans = formula.slice(0)
    for(let i = 0; i < formula.length; i++) {
        for(let j = 0; j < variables.length; j++) {
            if(ans[i] === variables[j]) {
                ans[i] = `${row[j]}`
            }
        }
    }
    return ans
}

const showTable = (table, answers, variables) => {
    console.log(variables.join(' '), ' result')
    for(let i = 0; i < table.length; i++) {
        console.log('', table[i].join(' '),'    ' + answers[i])
    }
}

const buildSKNF = (table, answers, variables) => {
    let answer = ""
    for(let i = 0; i < answers.length; i++) {
        if(answers[i] === 0) {
            answer += " ("
            for(let j = 0; j < table[i].length; j++) {
                if(table[i][j] === 1) {
                    answer += `!${variables[j]}`
                    if(j !== table[i].length - 1) {
                        answer += " \\/ "
                    }
                } else if( table[i][j] === 0) {
                    answer += variables[j]
                    if(j !== table[i].length - 1) {
                        answer += " \\/ "
                    }
                }
            }
            answer += ") /\\"
        }
    }
    answer = answer.substring(0, answer.length - 2)
    console.log(answer)
}

const buildSDNF = (table, answers, variables) => {
    let answer = ""
    for(let i = 0; i < answers.length; i++) {
        if(answers[i] === 1) {
            answer += " ("
            for(let j = 0; j < table[i].length; j++) {
                if(table[i][j] === 0) {
                    answer += `!${variables[j]}`
                    if(j !== table[i].length - 1) {
                        answer += " /\\ "
                    }
                } else if( table[i][j] === 1) {
                    answer += variables[j]
                    if(j !== table[i].length - 1) {
                        answer += " /\\ "
                    }
                }
            }
            answer += ") \\/"
        }
    }
    answer = answer.substring(0, answer.length - 2)
    console.log(answer)
}

const main = () => {
    let stackVariables = []
    let stackSigns = []
    let variables = []
    let formula = decodeFormula('((x1+(x2*(!x3)))->((x1~x2)*x4))') //'((1*1)*(1->(!1)))'
    stackVariables = buildStacks(stackVariables, stackSigns, formula)
    variables = stackVariables.slice(0)
    let table = buildTable(stackVariables.length)

    let answers = buildAnswers(formula, stackSigns, stackVariables, table)
    showTable(table, answers, variables)
    buildSDNF(table, answers, variables)
    console.log('----------------------------------------------')
    buildSKNF(table, answers, variables)
}

main()

/*const TestingFunction = () => {
    /!*let stackSigns = []
    let stackVariables = []
    let formula = decodeFormula('((1+(1*(!0)))->((1~1)*0))')
    stackVariables = buildStacks(stackVariables, stackSigns, formula)
    let ans = calculate(formula, stackVariables, stackSigns)
    console.log(ans)*!/
    let ans = Number(Conjuction("0", 1))
    console.log(ans)
}

TestingFunction()*/
