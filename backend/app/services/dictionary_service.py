import httpx
from typing import Optional, Dict, Any
from app.core.config import settings

class DictionaryService:
    @staticmethod
    async def lookup_word(word: str) -> Optional[Dict[str, Any]]:
        """Look up word definition using external API"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{settings.DICTIONARY_API_URL}/{word}")
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list) and len(data) > 0:
                        return data[0]
                
                return None
        except Exception:
            return None
    
    @staticmethod
    def format_definition(word_data: Dict[str, Any]) -> Dict[str, Any]:
        """Format dictionary response"""
        if not word_data:
            return {}
        
        result = {
            "word": word_data.get("word", ""),
            "phonetic": "",
            "phonetics": [],
            "meanings": [],
            "audio_url": None
        }
        
        # Extract phonetic information
        phonetics = word_data.get("phonetics", [])
        if phonetics:
            result["phonetics"] = phonetics
            # Get first phonetic with text
            for phonetic in phonetics:
                if phonetic.get("text"):
                    result["phonetic"] = phonetic["text"]
                    break
            
            # Get audio URL
            for phonetic in phonetics:
                if phonetic.get("audio"):
                    result["audio_url"] = phonetic["audio"]
                    break
        
        # Extract meanings
        meanings = word_data.get("meanings", [])
        if meanings:
            result["meanings"] = meanings
        
        return result
    
    @staticmethod
    def get_example_sentences(word_data: Dict[str, Any]) -> list:
        """Extract example sentences from dictionary data"""
        examples = []
        meanings = word_data.get("meanings", [])
        
        for meaning in meanings:
            definitions = meaning.get("definitions", [])
            for definition in definitions:
                if definition.get("example"):
                    examples.append(definition["example"])
        
        return examples[:3]  # Return first 3 examples
