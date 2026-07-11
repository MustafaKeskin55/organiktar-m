import { useEffect, useRef } from 'react';
import { websocketService } from '@/lib/websocket';
import type { WebSocketMessage, WebSocketMessageType } from '@/lib/websocket';
import { useAuthStore } from '@/store/authStore';

type MessageHandler<T = any> = (data: T) => void;

interface UseWebSocketOptions {
  onProductCreated?: MessageHandler;
  onProductUpdated?: MessageHandler;
  onProductDeactivated?: MessageHandler;
  onProductActivated?: MessageHandler;
  onOrderCreated?: MessageHandler;
  onOrderStatusUpdated?: MessageHandler;
  onOrderCancelled?: MessageHandler;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { user } = useAuthStore();
  const handlersRef = useRef(options);
  
  // Keep handlers up to date
  useEffect(() => {
    handlersRef.current = options;
  }, [options]);

  // Connect and subscribe
  useEffect(() => {
    let isMounted = true;

    const connect = async () => {
      try {
        await websocketService.connect();
        if (!isMounted) return;

        options.onConnect?.();

        // Subscribe to products
        websocketService.subscribeToProducts((message: WebSocketMessage) => {
          switch (message.type) {
            case 'PRODUCT_CREATED':
              handlersRef.current.onProductCreated?.(message.data);
              break;
            case 'PRODUCT_UPDATED':
              handlersRef.current.onProductUpdated?.(message.data);
              break;
            case 'PRODUCT_DEACTIVATED':
              handlersRef.current.onProductDeactivated?.(message.data);
              break;
            case 'PRODUCT_ACTIVATED':
              handlersRef.current.onProductActivated?.(message.data);
              break;
          }
        });

        // Subscribe to orders
        websocketService.subscribeToOrders((message: WebSocketMessage) => {
          switch (message.type) {
            case 'ORDER_CREATED':
              handlersRef.current.onOrderCreated?.(message.data);
              break;
            case 'ORDER_STATUS_UPDATED':
              handlersRef.current.onOrderStatusUpdated?.(message.data);
              break;
            case 'ORDER_CANCELLED':
              handlersRef.current.onOrderCancelled?.(message.data);
              break;
          }
        });

        // Subscribe to user-specific orders if logged in
        if (user?.id) {
          websocketService.subscribeToUserOrders(user.id, (message: WebSocketMessage) => {
            switch (message.type) {
              case 'ORDER_CREATED':
                handlersRef.current.onOrderCreated?.(message.data);
                break;
              case 'ORDER_STATUS_UPDATED':
                handlersRef.current.onOrderStatusUpdated?.(message.data);
                break;
              case 'ORDER_CANCELLED':
                handlersRef.current.onOrderCancelled?.(message.data);
                break;
            }
          });
        }
      } catch (error) {
        if (isMounted) {
          options.onError?.(error as Error);
        }
      }
    };

    connect();

    return () => {
      isMounted = false;
      // Note: We don't disconnect here to keep the connection alive across component mounts
      // The connection is managed globally
    };
  }, [user?.id, options.onConnect, options.onError]);

  return {
    isConnected: websocketService.isConnected,
  };
}

// Hook for real-time product updates
export function useProductWebSocket(
  onUpdate: (type: WebSocketMessageType, data: any) => void
) {
  return useWebSocket({
    onProductCreated: (data) => onUpdate('PRODUCT_CREATED', data),
    onProductUpdated: (data) => onUpdate('PRODUCT_UPDATED', data),
    onProductDeactivated: (data) => onUpdate('PRODUCT_DEACTIVATED', data),
    onProductActivated: (data) => onUpdate('PRODUCT_ACTIVATED', data),
  });
}

// Hook for real-time order updates
export function useOrderWebSocket(
  onUpdate: (type: WebSocketMessageType, data: any) => void
) {
  return useWebSocket({
    onOrderCreated: (data) => onUpdate('ORDER_CREATED', data),
    onOrderStatusUpdated: (data) => onUpdate('ORDER_STATUS_UPDATED', data),
    onOrderCancelled: (data) => onUpdate('ORDER_CANCELLED', data),
  });
}
