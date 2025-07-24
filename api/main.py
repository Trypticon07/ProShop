# TODO: Transfer this to another computer!
from gpt4all import GPT4All
from flask import Flask, request, jsonify

app = Flask(__name__)
model = GPT4All("Nous-Hermes-2-Mistral-7B-DPO.Q5_K_M.gguf",
                model_path="models", allow_download=False)


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    messages = data.get("messages", [])

    # Creating ChatML с <|im_start|> / <|im_end|>
    prompt = ""
    for msg in messages:
        role = msg["role"]
        content = msg["content"]
        prompt += f"<|im_start|>{role}\n{content}\n<|im_end|>\n"
    prompt += "<|im_start|>assistant\n"  # Model will start generation from here

    print("DEBUG PROMPT:\n", prompt)

    output = model.generate(prompt, max_tokens=256, temp=0.7)
    return jsonify({"response": output.strip()})


if __name__ == "__main__":
    app.run(port=5000)
