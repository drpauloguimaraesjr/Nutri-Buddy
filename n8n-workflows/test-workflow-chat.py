#!/usr/bin/env python3
"""
Script para testar o workflow de chat web do Nutri-Buddy
"""

import requests
import json
import time
from datetime import datetime

# Configurações
WEBHOOK_URL = "https://n8n-production-3eae.up.railway.app/webhook/nutribuddy-chat-handler"
CONVERSATION_ID = "T57IAET5UAcfkAO6HFUF"
PATIENT_ID = "hiAf8r28RmfnppmYBpvxQwTroNI2"
PRESCRIBER_ID = "6yooHer7ZgYOcYe0JHkXHLnWBq83"

def test_message(content, test_name):
    """Testa envio de mensagem"""
    print(f"\n{'='*60}")
    print(f"🧪 TESTE: {test_name}")
    print(f"{'='*60}")
    
    payload = {
        "conversationId": CONVERSATION_ID,
        "messageId": f"test-{int(time.time())}",
        "senderId": PATIENT_ID,
        "senderRole": "patient",
        "content": content,
        "type": "text",
        "patientId": PATIENT_ID,
        "prescriberId": PRESCRIBER_ID,
        "timestamp": datetime.now().isoformat()
    }
    
    print(f"\n📨 Mensagem:")
    print(f"   \"{content}\"")
    print(f"\n⏳ Enviando para N8N...")
    
    try:
        start_time = time.time()
        response = requests.post(WEBHOOK_URL, json=payload, timeout=30)
        duration = time.time() - start_time
        
        print(f"\n✅ Resposta recebida em {duration:.2f}s")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n📊 Resultado:")
            print(f"   Success: {result.get('success')}")
            print(f"   Urgência: {result.get('urgency')}")
            print(f"   Auto-resposta enviada: {result.get('autoReplySent')}")
            print(f"   IA funcionou: {result.get('aiSuccess')}")
            
            if result.get('skipped'):
                print(f"   ⚠️  Mensagem filtrada: {result.get('reason')}")
            
            return True
        else:
            print(f"\n❌ Erro:")
            print(f"   {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"\n❌ Timeout (>30s)")
        return False
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        return False

def main():
    """Executa bateria de testes"""
    print("="*60)
    print("🚀 BATERIA DE TESTES - Workflow Chat Web")
    print("="*60)
    print(f"\nWebhook: {WEBHOOK_URL}")
    print(f"Conversa: {CONVERSATION_ID}")
    
    tests = [
        {
            "name": "Mensagem Normal (Dúvida Simples)",
            "content": "Oi! Posso comer banana no café da manhã?"
        },
        {
            "name": "Mensagem Urgente (Sintoma)",
            "content": "Estou com muita dor de estômago e náusea forte depois de comer"
        },
        {
            "name": "Mensagem Positiva (Celebração)",
            "content": "Consegui perder 2kg essa semana! Estou muito feliz!"
        },
        {
            "name": "Mensagem Complexa (Mudança de Plano)",
            "content": "Gostaria de mudar minha dieta porque não estou conseguindo seguir"
        }
    ]
    
    results = []
    
    for i, test in enumerate(tests, 1):
        print(f"\n\n{'#'*60}")
        print(f"# TESTE {i}/{len(tests)}")
        print(f"{'#'*60}")
        
        success = test_message(test["content"], test["name"])
        results.append({
            "test": test["name"],
            "success": success
        })
        
        if i < len(tests):
            print(f"\n⏳ Aguardando 5 segundos antes do próximo teste...")
            time.sleep(5)
    
    # Resumo
    print(f"\n\n{'='*60}")
    print(f"📊 RESUMO DOS TESTES")
    print(f"{'='*60}")
    
    success_count = sum(1 for r in results if r["success"])
    total_count = len(results)
    
    for i, result in enumerate(results, 1):
        status = "✅" if result["success"] else "❌"
        print(f"{status} Teste {i}: {result['test']}")
    
    print(f"\n{'='*60}")
    print(f"Taxa de Sucesso: {success_count}/{total_count} ({success_count*100//total_count}%)")
    print(f"{'='*60}")
    
    if success_count == total_count:
        print(f"\n🎉 TODOS OS TESTES PASSARAM!")
        return 0
    else:
        print(f"\n⚠️  ALGUNS TESTES FALHARAM")
        return 1

if __name__ == "__main__":
    exit(main())

