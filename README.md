# ConditionalProcessor #

Example: 

    import { ConditionalProcessor } from "../index.js";
    import fs from "node:fs";

    let processor = new ConditionalProcessor();

    let text = fs.readFileSync("./test/templates/default/jscomponent.temp", "utf8");

    let newText = processor.parse(text);



with entry:

    @foreach(import)
    import ${import} from '';
    @endforeach

    @if(class)
    export default class ${component}{
        @if(state)
        @endif
    }
    @else
    export const ${component} = {
        
    };
    export default ${component};
    @endif
    @if(func)
    export const ${component} = () => {
        return;
    };

    export default ${component};
    @endif

    @foreach(const)
    export const ${const} = () => {
        return (
            <div>
                <h1>${const}</h1>
            </div>
        );
    };
    @endforeach

    @foreach(func)
    export const ${func} = () => {
        return;
    };
    @endforeach


suppose you use the next instruction in the CLI:  

    node index.mjs --class --func

Then the result is:

    @foreach(import)
    import ${import} from '';
    @endforeach

    export default class ${component}{
        @if(state)
        @endif
    }

    export const ${component} = () => {
        return;
    };

    export default ${component};

    @foreach(const)
    export const ${const} = () => {
        return (
            <div>
                <h1>${const}</h1>
            </div>
        );
    };
    @endforeach

    @foreach(func)
    export const ${func} = () => {
        return;
    };
    @endforeach