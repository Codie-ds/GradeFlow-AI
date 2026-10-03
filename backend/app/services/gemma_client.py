import time
import json
import logging
from google import genai
from google.genai import types

from app.config import settings

logger = logging.getLogger(__name__)

client = genai.Client(api_key=settings.gemma_api_key)

def call_gemma_json(system_prompt: str, user_prompt: str) -> dict:
    models_to_try = [settings.gemma_model]
    if settings.gemma_fallback_model:
        models_to_try.append(settings.gemma_fallback_model)

    last_error = None
    
    for attempt in range(3):
        model = models_to_try[0]
        if attempt == 2 and len(models_to_try) > 1:
            model = models_to_try[1]

        try:
            start_time = time.time()
            response = client.models.generate_content(
                model=model,
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.0,
                    response_mime_type="application/json",
                )
            )
            latency = time.time() - start_time
            
            usage = getattr(response, "usage_metadata", None)
            if usage:
                logger.info(f"Gemma ({model}) latency={latency:.2f}s tokens={usage.total_token_count}")
            else:
                logger.info(f"Gemma ({model}) latency={latency:.2f}s tokens=unknown")

            text = response.text or ""
            text = text.strip()
            if text.startswith("```json"):
                text = text[7:]
            elif text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
            text = text.strip()

            return json.loads(text)

        except Exception as e:
            last_error = e
            logger.warning(f"Gemma attempt {attempt + 1} failed with {type(e).__name__}: {e}")
            if attempt < 2:
                time.sleep(2 ** attempt)

    raise RuntimeError(f"Gemma failed after 3 attempts. Last error: {last_error}")
