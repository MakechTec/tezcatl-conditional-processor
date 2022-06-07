
export class ConditionParser{
    isFill = true;

    parse(text){
        let textItems = [];
        let ifRegexOnlyOne = new RegExp(IF_STATEMENT);
        let indexOfMatch = text.search(ifRegexOnlyOne);
        beforeCondition = text.split(indexOfMatch)[0];
        textItems.push({ before: new Text(beforeCondition)});
        let ifRegexMatch = text.match(ifRegexOnlyOne);
        textItems.push({ start: new Text(ifRegexMatch[0])});
        let endifRegexMatch = END_IF_STATEMENT;
        textItems.push({end: new Text(endifRegexMatch)});
        let indexOfEndIfMatch = text.search(new RegExp("(\@endif)(?!.*\1)", "g"));
        let afterText = text.split(indexOfEndIfMatch + END_IF_STATEMENT.length)[1];
        textItems.push({after: new Text(afterText)});
        let textContent = textItems.replace(beforeCondition, "");
        textContent = textContent.replace(ifRegexMatch[0], "");
        textContent = textContent.replace(endifRegexMatch, "");
        textContent = textContent.replace(afterText, "");

        textItems.push({content: new Text(textContent)});

        let flagName = this.extractFlag(textItems.start);

        return ;
    }

    getContent(){
        this.fillBlocks();
        let result = CLI.isFlag(this.flagName);
        
        let newText = result ? this.ifcontent : this.elsecontent;
        return "\n" + newText + "\n";
    }

    fillBlocks(){
        this.extractFlag();
        this.extractIfContent();

        if(this.originalContent.includes(ELSE_STATEMENT)){
            this.extractElseContent();
        }
    }

    extractFlag(start){
        return start.replace("@if(", "").replace(")", "");
    }

    extractIfContent(text){

        if(text.includes(ELSE_STATEMENT)){
            let elseIndex = newContent.indexOf(ELSE_STATEMENT);
            return text.substring(0, elseIndex);
        }
        
        return text;
    }

    extractElseContent(text){
        let elseIndex = text.indexOf(ELSE_STATEMENT);
        let notUsedString = text.substring(0, elseIndex) + ELSE_STATEMENT;

        return text.replace(notUsedString, "");
    }
}

export const IF_PATTERN = new RegExp("@if\\(.*\\)");
export const ELSE_PATTERN = new RegExp("@else");
export const END_IF_PATTERN = new RegExp("@endif");

export const IF_STATEMENT = "@if\\(.*\\)";
export const ELSE_STATEMENT = "@else";
export const END_IF_STATEMENT = "@endif";

export const IF_PATTERN_GEN = "\n*\s*@if\s*\(\s*.*\s*\)\s*\n*";