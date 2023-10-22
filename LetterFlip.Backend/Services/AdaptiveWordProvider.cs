using LetterFlip.Backend.Enumerations;
using Newtonsoft.Json;
using System.Reflection;

namespace LetterFlip.Backend.Services
{
    public class AdaptiveWordProvider : IAdaptiveWordProvider
    {
        private readonly List<string> sortedWords;
        private readonly Random rand = new Random(Guid.NewGuid().GetHashCode());
        private readonly Dictionary<DifficultyType, List<string>> cachedWordSubsets = new Dictionary<DifficultyType, List<string>>();

        public AdaptiveWordProvider()
        {
            // Read the sorted word list from the embedded resource
            var assembly = Assembly.GetExecutingAssembly();
            using Stream stream = assembly.GetManifestResourceStream("LetterFlip.Backend.SortedScrabbleDictionary.json");
            using StreamReader reader = new StreamReader(stream);
            string json = reader.ReadToEnd();
            sortedWords = JsonConvert.DeserializeObject<List<string>>(json);

            if (sortedWords == null || !sortedWords.Any())
            {
                throw new InvalidOperationException("The word list could not be loaded.");
            }
        }

        public string GetRandomWord(DifficultyType difficulty)
        {
            if (!cachedWordSubsets.TryGetValue(difficulty, out var wordSubset))
            {
                int skip, take;

                switch (difficulty)
                {
                    case DifficultyType.Easy:
                        skip = 0;
                        take = (int)(sortedWords.Count * 0.3);
                        break;
                    case DifficultyType.Medium:
                        skip = (int)(sortedWords.Count * 0.3);
                        take = (int)(sortedWords.Count * 0.4);
                        break;
                    case DifficultyType.Hard:
                        skip = (int)(sortedWords.Count * 0.7);
                        take = (int)(sortedWords.Count * 0.3);
                        break;
                    default:
                        throw new ArgumentException("Invalid difficulty type.");
                }

                wordSubset = sortedWords.Skip(skip).Take(take).ToList();
                cachedWordSubsets[difficulty] = wordSubset;

                if (wordSubset.Count == 0)
                {
                    throw new ArgumentException("The specified range did not contain any words.");
                }
            }

            lock (rand)
            {
                return wordSubset[rand.Next(wordSubset.Count)];
            }
        }
    }

}
