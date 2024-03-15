const Expertise = require('../../models/entities/group-experise');
const methods = require('../Constants').METHODS;
const crudService = require('../CRUD/crud.service');

exports.agregate = async function (id, expertsWeight) {
    let expertise = await Expertise.findById(id).populate('blanks').populate('experts');
    switch (expertise.template.method) {
        case methods.AHP: {
            return await groupAHP(expertise)
        }
        case methods.NORM: {
            return await groupWithWeight(expertise, expertsWeight)
        }
        case methods.RANGE: {
            return await groupRange(expertise);
        }
    }
}

async function groupAHP (expertise) {
    let multResult = {
        blanks: [],
        result: []
    };
    let result = expertise.blanks[0].result;
    multResult.result = result.rankedScores;
    multResult.blanks.push(result);
    for (let i = 1; i < expertise.blanks.length; i++) {
        result = expertise.blanks[i].result;
        multResult.result = arrayMultiply(multResult.result, result.rankedScores);
        multResult.blanks.push(result);
    }
    multResult.result = arraySqrt(multResult.result, expertise.blanks.length);
    expertise.result = {
        rankedScores: multResult.result
    };
    await crudService.updateGroupExpertize(expertise._id, expertise);
    return expertise;
}

function arrayMultiply (a, b) {
    let c = [];
    for (let i=0; i<a.length;i++) {
        c.push(a[i]*b[i]);
    }
    return c;
}

function arraySqrt (a, n) {
    let c = [];
    for (let i=0; i<a.length;i++) {
        c.push(Math.pow(a[i], 1/n));
    }
    return c;
}

async function groupWithWeight (expertise, expertsWeight) {
    expertise.expertsWeight = expertsWeight;
    expertise.save()
    let multResult = {
        blanks: [],
        result: []
    };
    let result = expertise.blanks[0].result;
    result.rankedScores = result.rankedScores.map(x => x * expertsWeight[0])
    multResult.result = result.rankedScores;
    multResult.blanks.push(result);
    for (let i = 1; i < expertise.blanks.length; i++) {
        result = expertise.blanks[i].result;
        result.rankedScores = result.rankedScores.map(x => x * expertsWeight[i])
        multResult.result = arraySum(multResult.result, result.rankedScores);
        multResult.blanks.push(result);
        result.rankedScores = result.rankedScores.map(x => x / expertsWeight[i])
    }
    multResult.result = arrayDiv(multResult.result, expertsWeight.length);
    expertise.result = {
        rankedScores: multResult.result
    };
    await crudService.updateGroupExpertize(expertise._id, expertise);
    return expertise;
}

async function groupRange (expertise) {
    let multResult = {
        blanks: [],
        result: []
    };
    let result = [];
    multResult.result = result.rankedScores;
    multResult.blanks.push(result);
    for (let i = 0; i < expertise.blanks.length; i++) {
        result.push(expertise.blanks[i].result.rankedScores);
    }
    console.log(result)
    let sumArr = [];
    for (let i = 0; i < result[0].length; i++) {
        sumArr.push(0)
    }
    for (let i = 0; i < result[0].length; i++) {
        for (let j = 0; j < result.length; j++) {
            sumArr[i] += result[j][i]
            console.log(`sumArr[${i}] `+ sumArr[i] + ` += result[${j}][${i}] - ` + result[j][i])
        }
    }
    expertise.result = {
        rankedScores: sumArr
    };
    let groupCoef = await getGroupCoef(expertise, result, sumArr);
    expertise.result.groupCoefitients = groupCoef;
    await crudService.updateGroupExpertize(expertise._id, expertise);
    return expertise;
}

async function getGroupCoef (expertise, blanksResults, sumArray) {
    let corelationArr = [];
    let competenceArr = [];
    let sumArr = [];
    for (let i = 0; i < blanksResults.length; i++) {
        sumArr.push(sumOfArray(blanksResults[i]));
    }
    let sumOfElements = sumOfArray(sumArr);
    sumArr = arrayDiv(expertise.result.rankedScores, expertise.blanks.length);
    let aSum = 0;
    let isConnected = false;
    let connectionsCount = [];
    let exeptions = [];
    let blanksResultsC = JSON.parse(JSON.stringify(blanksResults)) ; 
    for (let i = 0; i < blanksResultsC.length; i++) {
        connectionsCount.push([]);
        for (let j = 0; j < blanksResultsC[i].length; j++) {
            connectionsCount[i].push(0);
            if (blanksResultsC[i].indexOf(blanksResultsC[i][j]) !== j) {
                isConnected = true;
                for (let q = 0; q < blanksResults[i].length; q++) {
                    if ((blanksResultsC[i][q] === blanksResultsC[i][j]) && (exeptions.indexOf(blanksResultsC[i][j]) === -1)) {
                        connectionsCount[i][j] ++;
                    }
                }
                exeptions.push(blanksResultsC[i][j]);
            }
        }
        for (let j = 0; j < blanksResults[i].length; j++) {
            blanksResultsC[i][j] = Math.pow(Math.abs(sumArr[j] - blanksResultsC[i][j]), 2);
            aSum += blanksResultsC[i][j];
        }
        sumArr.push(aSum);
        aSum = 0;
    }
    for (let i = 0; i < blanksResultsC.length; i++) {
        corelationArr.push(1 - ((6 * sumOfArray(blanksResultsC[i]))/(Math.pow(blanksResultsC[i].length, 3) - blanksResultsC[i].length)))
    }
    let corelationMin = Math.min.apply(null, corelationArr);
    let corelationMax = Math.max.apply(null, corelationArr);
    for (let i = 0; i < corelationArr.length; i++) {
        competenceArr.push((corelationArr[i] - corelationMin)/(corelationMax - corelationMin));
    }
    sumOfElements = sumOfElements / blanksResults[0].length;
    let sumDif = sumArray.map(x => Math.pow(sumOfElements - x, 2))
    let s = sumOfArray(sumDif);
    let sMax;
    let sumForGroups = 0;
    if (isConnected) {
        for (let i = 0; i < connectionsCount.length; i++) {
            for (let j = 0; j < connectionsCount[i].length; j++) {
                connectionsCount[i][j] = Math.pow(connectionsCount[i][j], 3) - connectionsCount[i][j];
                sumForGroups += connectionsCount[i][j]
            }
        }
        sMax = ((Math.pow(blanksResults.length, 2) * (Math.pow(blanksResultsC[0].length, 3) - blanksResultsC[0].length)) - (blanksResults.length * sumForGroups));
    } else {
        sMax = (Math.pow(blanksResultsC.length, 2) * (Math.pow(blanksResultsC[0].length, 3) - blanksResultsC[0].length))/12;
    }
    let w = 12 * s/sMax;
    return {competenceCoef: competenceArr, concordance: w}
}

function sumOfArray (a) {
    let c = 0;
    for (let i = 0; i < a.length; i++) {
        c += a[i]
    }
    return c
}

function arraySum (a, b) {
    let c = [];
    for (let i=0; i<a.length;i++) {
        c.push(a[i]+b[i]);
    }
    return c;
}

function arrayDiv (a ,n) {
    let c = [];
    for (let i=0; i<a.length;i++) {
        c.push(a[i]/n);
    }
    return c;
}
