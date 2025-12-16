// Creating a tooltip html once to be reused
const tooltip = document.createElement('div');
tooltip.id = 'subsense-tooltip';
document.body.appendChild(tooltip);

// Helper function to hide tooltip
function hideTooltip() {
    tooltip.style.display = 'none';
}

// Wrap all logic in a function so it can run repeatedly
function processSubtitles() {
    // Finding all the subtitle segments (return a NodeList)
    const allSubtitleContainers = document.querySelectorAll('.ytp-caption-segment');

    // Checking if we found any subtitle containers(segments)
    if(allSubtitleContainers.length > 0){
        // Looping through each subtitle container
        allSubtitleContainers.forEach((container) => {
            // Preventing double-processing by checking if we already added our special class, if we did, then we skip this segment so we don't break it
            if(container.getAttribute('data-processed') === 'true') return;

            // Segment-wise transformation
            const originalText = container.innerText;
            // Splitting the words on a space and storing them in a wordsArray
            const wordsArray = originalText.split(' ');

            // Wrapping the individual words from the subtitle with a HTML span tag - inline container used to group a small section of text for styling or manipulation
            const wrappedWords = wordsArray.map(word => {
                if(word.trim() === "") return word; // Ensuring we don't wrap empty strings (extra spaces)
                return `<span class="interactive-word" style="cursor: pointer; padding: 0 2px;">${word}</span>`;
            });

            // Joining these - now, span class words with each other with a space in between
            const newHTML = wrappedWords.join(' ');
            // It wipes out whatever was inside the subtitle box originally and replaces it with our new string
            container.innerHTML = newHTML;

            // Marking this segment as "done" so we don't accidentally re-process it later and break the code
            container.setAttribute('data-processed', 'true');

            // Adding the listeners to the container (the parent of the words)
            // Mouseover listener (hover) - Show Tooltip
            container.addEventListener('mouseover', async(event) => {
                if(event.target.classList.contains('interactive-word')){
                    const targetWord = event.target;
                    // Styling the hovered word
                    targetWord.style.backgroundColor = "rgba(255, 204, 0, 0.3)";
                    targetWord.style.borderRadius = "3px";
                    
                    // Getting the raw word
                    const rawWord = targetWord.innerText;
                    // regex logic: removing anything that is not a letter (a-z or A-Z) mainly punctuation
                    const cleanWord = rawWord.replace(/[^a-zA-Z]/g, "");

                    if(cleanWord.length > 0){
                        try{
                            // Showing "Loading..." while fetching
                            tooltip.style.display = 'block';
                            tooltip.style.left = `${event.pageX + 10}px`;
                            tooltip.style.top = `${event.pageY + 10}px`;
                            tooltip.innerHTML = `Loading definition for <b>${cleanWord}</b>...`;

                            // Fetching definition from Free Dictionary API
                            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
                            if(!response.ok){
                                throw new Error("Word not found in dictionary.");
                            }

                            const data = await response.json();
                            
                            // Building the List HTML
                            let definitionListHTML = "";
                            const meanings = data[0].meanings;

                            // Limiting to top 3 meanings to simplify the scope and avoid huge popups
                            meanings.slice(0, 3).forEach(meaning => {
                                const partOfSpeech = meaning.partOfSpeech; // e.g., noun, verb, etc.
                                // Taking only the first definiton for each part of speech
                                const definition = meaning.definitions[0].definition;

                                definitionListHTML += `<li><span class="subsense-pos">${partOfSpeech}</span> ${definition}</li>`;
                            });

                            // Injecting the final HTML into the tooltip
                            tooltip.innerHTML = `
                                <h3>${cleanWord}</h3>
                                <ul>${definitionListHTML}</ul>
                            `;
                        } catch(error){
                            tooltip.innerHTML = `No definition found for <b>${cleanWord}</b>.`;
                        }
                    }
                }
            });

            // Mouseout listener
            container.addEventListener('mouseout', (event) => {
                if(event.target.classList.contains('interactive-word')) {
                    // Removing the hover styling
                    event.target.style.backgroundColor = "transparent";
                    // Hiding the tooltip
                    hideTooltip();
                }
            });
        }); 
    }
}

// Running the function every second to catch new subtitle containers (segments) as they appear
setInterval(processSubtitles, 1000);