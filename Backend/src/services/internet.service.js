const { tavily } = require("@tavily/core");

const tvly = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});


// Search the internet using Tavily.
module.exports.searchInternet = async ({ query }) => {
  try {
    const response = await tvly.search(query, {
      maxResults: 5,
      searchDepth: "basic",
    });

    if (!response.results || response.results.length === 0) {
      return "No relevant results found for the query.";
    }

    // Format results as a readable string for the agent
    const formatted = response.results
      .map(
        (r, i) =>
          `[${i + 1}] ${r.title}\nURL: ${r.url}\n${r.content}`
      )
      .join("\n\n");

    return formatted;
  } catch (error) {
    console.log(error);
    return "Error while searching the internet.";
  }
};