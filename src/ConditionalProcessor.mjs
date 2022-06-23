import { Pipe } from "@makechtec/pipe";
import { CLI } from "@makechtec/tezcatl-cli";

export class ConditionalProcessor{

    parse(text){

        let newText = text;
        let shouldBeResolved = this.isAnyCondition(newText);

        while( shouldBeResolved){
            
            newText = new Pipe(newText)
                        .addAction(this.read)
                        .addAction(this.createConditions)
                        .addAction((conditions) => {
                            return this.evaluate(conditions, newText);
                        })
                        .execActions();

            shouldBeResolved = this.isAnyCondition(newText);
        }

        return newText;
        
    }

    evaluate(conditions, originalText) {
        let lessDeep = this.conditionWithLessDeep(conditions);
        let flag = lessDeep.flagName();
        let newText = "";
        if (CLI.isFlag(flag)) {
            if (lessDeep.pivot !== null) {
                newText = originalText.substring(lessDeep.start.endIndex, lessDeep.pivot.startIndex);
            }
            else {
                newText = originalText.substring(lessDeep.start.endIndex, lessDeep.end.startIndex);
            }
        }
        else {
            if (lessDeep.pivot !== null) {
                newText = originalText.substring(lessDeep.pivot.endIndex, lessDeep.end.startIndex);
            }
            else {
                newText = "";
            }
        }

        let originalConditionContent = originalText.substring(lessDeep.start.startIndex, lessDeep.end.endIndex);
        let cleanText = originalText.replace(originalConditionContent, newText);
        return cleanText;
    }

    conditionWithLessDeep(conditions){

        let minDeep = conditions.map(c => c.deep).reduce((a, b) => Math.min(a, b));
        let lessDeep = conditions.find(condition => condition.deep === minDeep);
        return lessDeep;
    }

    createConditions(matchesAll){

        let deepCount = 0;
        let conditions = [];

        for(let i = 0; i < matchesAll.length; i++){

            let startRegex = new RegExp(IF_STATEMENT);
            let pivotRegex = new RegExp(ELSE_STATEMENT);
            let endRegex = new RegExp(END_IF_STATEMENT);

            if(startRegex.test(matchesAll[i].content)){
                deepCount++;
                let condition = new Condition();
                condition.start = matchesAll[i];
                condition.deep = deepCount;
                conditions.push(condition);
            }
            else if(pivotRegex.test(matchesAll[i].content)){

                for(let j = conditions.length - 1; j >= 0; j--){
                    if(conditions[j].completed){
                        continue;
                    }

                    conditions[j].pivot = matchesAll[i];
                    break;
                }
                
            }
            else if(endRegex.test(matchesAll[i].content)){
                for(let j = conditions.length - 1; j >= 0; j--){
                    if(conditions[j].completed){
                        continue;
                    }

                    conditions[j].end = matchesAll[i];
                    conditions[j].completed = true;
                    deepCount--;
                    break;
                }
                
            }

        }

        return conditions;
    }

    read(text) {
        let startRegex = new RegExp("(@if\\(.*\\))|(@else)|(@endif)", "g");
        let result;
        let matchesAll = [];

        while ((result = startRegex.exec(text)) !== null) {
            let pointer = new Pointer();
            pointer.startIndex = result.index;
            pointer.endIndex = startRegex.lastIndex;
            pointer.content = result[0];

            matchesAll.push(pointer);
        }

        return matchesAll;
    }

    isAnyCondition(text){
        let startRegex = new RegExp("(@if\\(.*\\))", "g");
        let endRegex = new RegExp("(@endif)", "g");

        return startRegex.test(text) && endRegex.test(text);
    }
}

class Pointer{
    startIndex;
    endIndex;
    content;
}

class Condition{
    start;
    pivot = null;
    end;
    deep;
    conditions = [];
    completed = false;

    flagName(){
        return this.start.content.replace("@if(", "").replace(")", "");
    }
}

const IF_STATEMENT = "@if\\(.*\\)";
const ELSE_STATEMENT = "@else";
const END_IF_STATEMENT = "@endif";