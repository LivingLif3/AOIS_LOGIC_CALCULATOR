
const bin_to_int = (number) => {
    let res = 0
    for(let i = 1; i < number.length; i++) {
        if(number[i] == 1) {
            res += 2**(number.length - 1 - i)
        }
    }
    if(number[0] === 1) {
        res *= -1
    }
    return res
}

const bin_to_num = (number) => {
    let ans = 0
    let intPart = []
    let i = 0
    while(number[i] !== '.') {
        intPart.push(number[i])
        i++
    }
    ans = bin_to_int(intPart)
    let degree = -1
    for (let j = number.indexOf('.') + 1; j < number.length; j++) {
        ans += (number[j]) * 2**degree;
        degree--;
    }
    return ans;
}

const decodeFormula = (formula) => {
    let arr = formula.split('')
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === '-' && arr[i + 1] === '>') {
            arr[i] = '->'
            arr.splice(i + 1, 1)
        }
        let j = i + 1
        let term = ''
        while (!!Number(arr[j])) {
            term += arr[j]
            j++
        }

        if (arr[i] !== '(' && arr[i] !== '!' && arr[i] !== '*' && arr[i] !== '+') {
            arr[i] += term
            arr.splice(i + 1, term.length)
        }
    }
    return arr
}

let getPriority = (operator) => {
    switch (operator) {
        case '!':
            return 6
        case '*':
            return 5
        case '+':
            return 4
        case '~':
            return 2
        case '->':
            return 3
        default:
            return 1
    }
    // if (operator === '!') {
    //     return 6
    // } else if (operator === '*') {
    //     return 5
    // } else if (operator === '+') {
    //     return 4
    // } else if(operator === '~') {
    //     return 2
    // } else if (operator === '->') {
    //     return 3
    // } else {
    //     return 1
    // }
}

const checkOnSign = (element) => {
    let signs = ['!', '*', '+', '->', '(', ')', '~']
    return signs.indexOf(element) !== -1
    // if (signs.indexOf(element) !== -1) {
    //     return true
    // } else {
    //     return false
    // }
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
    switch (sign){
        case '*':
            return Conjuction(a, b)
        case '+':
            return Disjuction(a, b)
        case '->':
            return Implication(b, a)
        default:
            return Equivalence(a, b)
    }
    // if (sign === '*') {
    //     return Conjuction(a, b)
    // } else if (sign === '+') {
    //     return Disjuction(a, b)
    // } else if (sign === '->') {
    //     return Implication(b, a)
    // } else {
    //     return Equivalence(a, b)
    // }
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

const buildNumForm = (table, answers) => {
    console.log('SKNF:')
    let ans1 = []
    let ans2 = []
    for(let i = 0; i < answers.length; i++) {
        if(!answers[i]) {
            ans1.push(i)
        } else {
            ans2.push(i)
        }
    }
    console.log(ans1.join(', '))
    console.log('------------------------------------------')
    console.log('SDNF:')
    console.log(ans2.join(', '))
}

const buildInt = (answers) => {
    let answersCopy = answers.slice(0)
    answersCopy.unshift(0)
    answersCopy.push('.')
    let ans = bin_to_num(answersCopy)
    console.log(`Index form - ${ans}`)
    return ans
}


const main = () => {
    let stackVariables = []
    let stackSigns = []
    let variables = []
    let formula = decodeFormula('((x1+(x2*x3))->(!x1~(!x2)))') //'((1*1)*(1->(!1)))'
    stackVariables = buildStacks(stackVariables, stackSigns, formula)
    variables = stackVariables.slice(0)
    let table = buildTable(stackVariables.length)

    let answers = buildAnswers(formula, stackSigns, stackVariables, table)
    showTable(table, answers, variables)
    buildSDNF(table, answers, variables)
    console.log('----------------------------------------------')
    buildSKNF(table, answers, variables)
    console.log('----------------------------------------------')
    buildNumForm(table, answers)
    console.log('----------------------------------------------')
    buildInt(answers)
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
