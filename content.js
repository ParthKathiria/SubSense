// Finding all the subtitle segments (return a NodeList)
const allSubtitleContainers = document.querySelectorAll('.ytp-caption-segment')

// Checking if we found any subtitle containers(segments)
if(allSubtitleContainers > 0){
    // Looping through each subtitle container
    allSubtitleContainers.forEach((container) => {
        // Preventing double-processing by checking if we already added our special class, if we did, then we skip this segment so we don't break it
        if(container.getAttribute('data-processed') === true) return;

        // Segment-wise transformation
        const originalText = container.innerText;
        // Splitting the words on a space and storing them in a wordsArray
        const wordsArray = originalText.split(' ');

        // Wrapping the individual words from the subtitle with a HTML span tag - inline container used to group a small section of text for styling or manipulation
        const wrappedWords = wordsArray.map(word => {
            return `<span class="interactive-word" style="cursor: pointer; padding: 0 2px;">${word}</span>`;
        });

        // Joining these - now, span class words with each other with a space in between
        const newHTML = wrappedWords.join(' ');
        // It wipes out whatever was inside the subtitle box originally and replaces it with our new string
        segment.innerHTML = newHTML;

        // Marking this segment as "done" so we don't accidentally re-process it later and break the code
        segment.setAttribute('data-processed', 'true');

        // Adding the listeners to the container (the parent of the words)
        // Mouseover listener
        container.addEventListener('mouseover', (event) => {
            if(event.target.classList.contains('interactive-word')){
                event.target.style.backgroundColor = "yellow";
                event.target.style.color = "black";
                console.log("Lookup Word: ", event.target.innerText);
            }
        });
        // Mouseout listener
        container.addEventListener('mouseout', (event) => {
            if(event.target.classList.contains('interactive-word')) {
                event.target.style.backgroundColor = "transparent";
                event.target.style.color = "";
            }
        });
    });

    console.log(`Processed ${allSegments.length} segment(s).`)
} else {
    console.log("No subtitle container found.")
}
