
export class Processor{

    matchesAll = [];
    deepCount = 0;
    conditions = [];

    parse(text){
        let originalText = text;
        this.read(text);
        this.count();
        let cleanText = this.evaluateCondition(originalText);
        console.log(cleanText);
    }

    evaluateCondition(originalText) {
        let lessDeep = this.conditionWithLessDeep(this.conditions);
        let flag = lessDeep.flagName();
        let newText = "";
        if (false) {
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

    count(){

        this.deepCount = 0;
        for(let i = 0; i < this.matchesAll.length; i++){

            let startRegex = new RegExp(IF_STATEMENT);
            let pivotRegex = new RegExp(ELSE_STATEMENT);
            let endRegex = new RegExp(END_IF_STATEMENT);

            if(startRegex.test(this.matchesAll[i].content)){
                this.deepCount++;
                let condition = new Condition();
                condition.start = this.matchesAll[i];
                condition.deep = this.deepCount;
                this.conditions.push(condition);
            }
            else if(pivotRegex.test(this.matchesAll[i].content)){

                for(let j = this.conditions.length - 1; j >= 0; j--){
                    if(this.conditions[j].completed){
                        continue;
                    }

                    this.conditions[j].pivot = this.matchesAll[i];
                    break;
                }
                
            }
            else if(endRegex.test(this.matchesAll[i].content)){
                for(let j = this.conditions.length - 1; j >= 0; j--){
                    if(this.conditions[j].completed){
                        continue;
                    }

                    this.conditions[j].end = this.matchesAll[i];
                    this.conditions[j].completed = true;
                    this.deepCount--;
                    break;
                }
                
            }

        }

    }

    read(text) {
        let startRegex = new RegExp("(@if\\(.*\\))|(@else)|(@endif)", "g");
        let result;
        while ((result = startRegex.exec(text)) !== null) {
            let pointer = new Pointer();
            pointer.startIndex = result.index;
            pointer.endIndex = startRegex.lastIndex;
            pointer.content = result[0];

            this.matchesAll.push(pointer);
        }
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

    add(condition){
        this.conditions.push(condition);
    }

    flagName(){
        return this.start.content.replace("@if(", "").replace(")", "");
    }

    evaluate(){
        let content = "";
        let ownContent = " evaluated! ";

        this.conditions.forEach(condition => {
            content += condition.evaluate();
        });
        
        content += ownContent;

        return content;
    }
}

export const IF_STATEMENT = "@if\\(.*\\)";
export const ELSE_STATEMENT = "@else";
export const END_IF_STATEMENT = "@endif";