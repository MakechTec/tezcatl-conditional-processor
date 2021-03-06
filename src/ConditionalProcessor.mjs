import { Pipe } from "@makechtec/pipe";
import { CLI, Pattern } from "@makechtec/tezcatl-cli";

export class ConditionalProcessor{

    parse(text){

        if(this.isBadCondition(text)){
            console.error("Error: conditional statement is not well formed or is not closed");
            return "";
        }

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
        let startRegex = new RegExp(ANY_STATEMENT, "g");
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
        let startRegex = new RegExp(IF_STATEMENT, "g");
        let endRegex = new RegExp(END_IF_STATEMENT, "g");

        return startRegex.test(text) && endRegex.test(text);
    }

    isBadCondition(text){
        let startRegex = new RegExp(IF_STATEMENT, "g");
        let endRegex = new RegExp(END_IF_STATEMENT, "g");

        let countMatchesStart = Pattern.countMatches(text, startRegex);
        let countMatchesEnd = Pattern.countMatches(text, endRegex);

        return countMatchesStart !== countMatchesEnd;
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
        return this.start.content.replace(new RegExp(/@if\s*\(/), "").replace(new RegExp(/\s*\)/), "");
    }
}

export const IF_STATEMENT = "@if\\s*\\(\\s*([a-z|A-Z|\\d]*)\\s*?\\)";
export const ELSE_STATEMENT = "@else";
export const END_IF_STATEMENT = "@endif";
export const ANY_STATEMENT = "("+IF_STATEMENT+")|("+ELSE_STATEMENT+")|("+END_IF_STATEMENT+")";