
export class Processor{

    matchesAll = [];
    deepCount = 0;
    conditions = [];

    parse(text){
        this.read(text);
        this.count();

        
    }

    conditionWithLessDeep(){

        let minDeep = this.conditions.map(c => c.deep).reduce((a, b) => Math.min(a, b));
        let lessDeep = this.conditions.find(condition => condition.deep === minDeep);
        console.log(lessDeep);
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
    pivot;
    end;
    deep;
    conditions = [];
    completed = false;

    add(condition){
        this.conditions.push(condition);
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