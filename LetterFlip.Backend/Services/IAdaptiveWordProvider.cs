using LetterFlip.Backend.Enumerations;

namespace LetterFlip.Backend.Services
{
    public interface IAdaptiveWordProvider
    {
        string GetRandomWord(DifficultyType difficulty);
    }
}
