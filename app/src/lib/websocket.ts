import { Client } from '@stomp/stompjs';
import type { IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = 'http://localhost:8081/ws';

export type WebSocketMessageType = 
  | 'PRODUCT_CREATED' 
  | 'PRODUCT_UPDATED' 
  | 'PRODUCT_DEACTIVATED' 
  | 'PRODUCT_ACTIVATED'
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_UPDATED'
  | 'ORDER_CANCELLED';

export interface WebSocketMessage<T = any> {
  type: WebSocketMessageType;
  data: T;
}

class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private isConnecting = false;
  private connectionListeners: Set<(connected: boolean) => void> = new Set();

  // Bağlantı durumu değişikliklerini dinle
  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.add(callback);
    // Mevcut durumu bildir
    callback(this.isConnected());
    // Unsubscribe fonksiyonu döndür
    return () => this.connectionListeners.delete(callback);
  }

  private notifyConnectionChange(connected: boolean) {
    this.connectionListeners.forEach(callback => callback(connected));
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.client?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for connection
        const checkInterval = setInterval(() => {
          if (this.client?.connected) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!this.client?.connected) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);
        return;
      }

      this.isConnecting = true;

      this.client = new Client({
        webSocketFactory: () => new SockJS(WS_URL),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('✅ WebSocket bağlantısı kuruldu!');
          this.isConnecting = false;
          this.notifyConnectionChange(true);
          resolve();
        },
        onDisconnect: () => {
          console.log('❌ WebSocket bağlantısı koptu');
          this.notifyConnectionChange(false);
        },
        onStompError: (frame) => {
          console.error('STOMP hatası:', frame);
          this.isConnecting = false;
          this.notifyConnectionChange(false);
          reject(new Error('STOMP error'));
        },
        onWebSocketError: (event) => {
          console.error('WebSocket hatası:', event);
          this.isConnecting = false;
          this.notifyConnectionChange(false);
          // Bağlantı hatası - backend çalışmıyor olabilir
          console.warn('⚠️ Backend WebSocket bağlantısı kurulamadı. Backend\'in çalıştığından emin olun.');
          reject(new Error('WebSocket error - Backend çalışmıyor olabilir'));
        },
      });

      this.client.activate();
    });
  }

  disconnect(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
    this.client?.deactivate();
    console.log('WebSocket disconnected');
  }

  subscribe<T>(
    destination: string,
    callback: (message: WebSocketMessage<T>) => void
  ): StompSubscription | null {
    if (!this.client?.connected) {
      console.warn('WebSocket not connected, cannot subscribe to:', destination);
      return null;
    }

    const subscription = this.client.subscribe(destination, (message: IMessage) => {
      try {
        const body: WebSocketMessage<T> = JSON.parse(message.body);
        console.log('WebSocket message received:', body.type, body.data);
        callback(body);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    this.subscriptions.set(destination, subscription);
    console.log('Subscribed to:', destination);
    return subscription;
  }

  unsubscribe(destination: string): void {
    const sub = this.subscriptions.get(destination);
    if (sub) {
      sub.unsubscribe();
      this.subscriptions.delete(destination);
      console.log('Unsubscribed from:', destination);
    }
  }

  // ========== PRODUCT SUBSCRIPTIONS ==========

  subscribeToProducts<T>(callback: (message: WebSocketMessage<T>) => void): StompSubscription | null {
    return this.subscribe('/topic/products', callback);
  }

  // ========== ORDER SUBSCRIPTIONS ==========

  subscribeToOrders<T>(callback: (message: WebSocketMessage<T>) => void): StompSubscription | null {
    return this.subscribe('/topic/orders', callback);
  }

  subscribeToUserOrders<T>(
    userId: string,
    callback: (message: WebSocketMessage<T>) => void
  ): StompSubscription | null {
    return this.subscribe(`/queue/orders/${userId}`, callback);
  }

  // ========== UTILITY METHODS ==========

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  getClient(): Client | null {
    return this.client;
  }
}

// Singleton instance
export const websocketService = new WebSocketService();
