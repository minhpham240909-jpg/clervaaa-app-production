import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatWindow from '@/components/chat/ChatWindow';
import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    channel: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(),
    removeChannel: jest.fn(),
  },
}));

jest.mock('@/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn(() => ({
    getRootProps: () => ({ 'data-testid': 'dropzone' }),
    getInputProps: () => ({ 'data-testid': 'file-input' }),
    isDragActive: false,
  })),
}));

jest.mock('emoji-picker-react', () => {
  return function MockEmojiPicker({ onEmojiClick }: any) {
    return (
      <div data-testid="emoji-picker">
        <button 
          onClick={() => onEmojiClick({ emoji: '😀' })}
          data-testid="emoji-button"
        >
          😀
        </button>
      </div>
    );
  };
});

jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn(() => '5 minutes ago'),
}));

// Mock scroll behavior
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: jest.fn(),
  writable: true,
});

const mockProps = {
  chatId: '1',
  userId: 'user-123',
  onStartCall: jest.fn(),
};

const mockMessage = {
  id: '1',
  content: 'Hello test message',
  type: 'TEXT' as const,
  senderId: 'user-456',
  sender: {
    id: 'user-456',
    name: 'Test User',
    image: null,
  },
  createdAt: new Date().toISOString(),
  isEdited: false,
  reactions: [],
};

describe('ChatWindow', () => {
  let mockChannel: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockChannel = {
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn(),
    };
    
    (supabase.channel as jest.Mock).mockReturnValue(mockChannel);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders loading spinner initially', () => {
    render(<ChatWindow {...mockProps} />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders chat interface after loading', async () => {
    render(<ChatWindow {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });

  it('displays chat header with correct information', async () => {
    render(<ChatWindow {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    });

    expect(screen.getByTitle('Start voice call')).toBeInTheDocument();
    expect(screen.getByTitle('Start video call')).toBeInTheDocument();
  });

  it('handles message input and submission', async () => {
    const user = userEvent.setup();
    render(<ChatWindow {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    });

    const messageInput = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: /send message/i });

    // Initially send button should be disabled
    expect(sendButton).toBeDisabled();

    // Type a message
    await user.type(messageInput, 'Test message');
    expect(sendButton).not.toBeDisabled();

    // Send the message
    await user.click(sendButton);
    
    // Input should be cleared
    expect(messageInput).toHaveValue('');
    expect(sendButton).toBeDisabled();
  });

  it('handles Enter key press to send message', async () => {
    const user = userEvent.setup();
    render(<ChatWindow {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    });

    const messageInput = screen.getByPlaceholderText('Type a message...');
    
    await user.type(messageInput, 'Test message');
    await user.keyboard('{Enter}');
    
    expect(messageInput).toHaveValue('');
  });

  it('does not send message on Shift+Enter', async () => {
    const user = userEvent.setup();
    render(<ChatWindow {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    });

    const messageInput = screen.getByPlaceholderText('Type a message...');
    
    await user.type(messageInput, 'Test message');
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    
    // Message should not be cleared (not sent)
    expect(messageInput).toHaveValue('Test message');
  });

  it('displays messages correctly', async () => {
    render(<ChatWindow {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText("Hey! Ready for our calculus study session?")).toBeInTheDocument();
      expect(screen.getByText("Absolutely! I've been working through the practice problems.")).toBeInTheDocument();
    });
  });

  it('handles voice call initiation', async () => {
    const user = userEvent.setup();
    render(<ChatWindow {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Start voice call')).toBeInTheDocument();
    });

    const voiceCallButton = screen.getByTitle('Start voice call');
    await user.click(voiceCallButton);
    
    expect(mockProps.onStartCall).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'AUDIO',
        chatRoomId: '1',
      })
    );
  });

  it('handles video call initiation', async () => {
    const user = userEvent.setup();
    render(<ChatWindow {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Start video call')).toBeInTheDocument();
    });

    const videoCallButton = screen.getByTitle('Start video call');
    await user.click(videoCallButton);
    
    expect(mockProps.onStartCall).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'VIDEO',
        chatRoomId: '1',
      })
    );
  });

  it('displays emoji picker when emoji button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChatWindow {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Add emoji')).toBeInTheDocument();
    });

    const emojiButton = screen.getByTitle('Add emoji');
    await user.click(emojiButton);
    
    expect(screen.getByTestId('emoji-picker')).toBeInTheDocument();
  });

  it('adds emoji to message input', async () => {
    const user = userEvent.setup();
    render(<ChatWindow {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Add emoji')).toBeInTheDocument();
    });

    const messageInput = screen.getByPlaceholderText('Type a message...');
    const emojiButton = screen.getByTitle('Add emoji');
    
    await user.click(emojiButton);
    await user.click(screen.getByTestId('emoji-button'));
    
    expect(messageInput).toHaveValue('😀');
  });

  it('shows file attachment button', async () => {
    render(<ChatWindow {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Attach file')).toBeInTheDocument();
    });
  });

  it('handles file attachment click', async () => {
    const user = userEvent.setup();
    render(<ChatWindow {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByTitle('Attach file')).toBeInTheDocument();
    });

    const attachButton = screen.getByTitle('Attach file');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    
    // Mock the file input click
    const clickSpy = jest.spyOn(fileInput, 'click').mockImplementation();
    jest.spyOn(document, 'querySelector').mockReturnValue(fileInput);
    
    await user.click(attachButton);
    // File input should be triggered (implementation details)
  });

  it('displays typing indicators', async () => {
    render(<ChatWindow {...mockProps} />);
    
    // Mock typing users by updating component state directly
    await waitFor(() => {
      expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    });

    // Simulate typing broadcast
    act(() => {
      const typingHandler = mockChannel.on.mock.calls.find(
        (call: any) => call[1].event === 'typing'
      )?.[1];
      
      if (typingHandler) {
        typingHandler({ payload: { userId: 'other-user', isTyping: true } });
      }
    });

    await waitFor(() => {
      expect(screen.getByText('Someone is typing...')).toBeInTheDocument();
    });
  });

  it('displays message reactions', async () => {
    render(<ChatWindow {...mockProps} />);
    
    await waitFor(() => {
      // Look for the thumbs up reaction on the third message
      expect(screen.getByText('👍')).toBeInTheDocument();
    });
  });

  it('handles message reaction clicks', async () => {
    const user = userEvent.setup();
    render(<ChatWindow {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByText('👍')).toBeInTheDocument();
    });

    const reactionButton = screen.getByText('👍').closest('button');
    if (reactionButton) {
      await user.click(reactionButton);
      // Reaction should be toggled (implementation would update state)
    }
  });

  it('sets up supabase subscription correctly', () => {
    render(<ChatWindow {...mockProps} />);
    
    expect(supabase.channel).toHaveBeenCalledWith('chat-1');
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        event: 'INSERT',
        schema: 'public',
        table: 'ChatMessage',
        filter: 'chatRoomId=eq.1',
      }),
      expect.any(Function)
    );
  });

  it('handles real-time message updates', async () => {
    render(<ChatWindow {...mockProps} />);
    
    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalled();
    });

    // Simulate new message from real-time subscription
    act(() => {
      const messageHandler = mockChannel.on.mock.calls.find(
        (call: any) => call[0] === 'postgres_changes'
      )?.[2];
      
      if (messageHandler) {
        messageHandler({
          new: {
            id: 'new-message',
            content: 'New real-time message',
            type: 'TEXT',
            senderId: 'other-user',
            chatRoomId: '1',
            createdAt: new Date().toISOString(),
          },
        });
      }
    });

    // Should display the new message (though with mock sender data)
    await waitFor(() => {
      expect(screen.getByText('New real-time message')).toBeInTheDocument();
    });
  });

  it('cleans up subscription on unmount', () => {
    const { unmount } = render(<ChatWindow {...mockProps} />);
    
    unmount();
    
    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });

  it('handles error states gracefully', async () => {
    // Mock console.error to avoid noise in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<ChatWindow {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    });

    // Should not crash and should show UI elements
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('scrolls to bottom when new messages arrive', async () => {
    const scrollSpy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');
    
    render(<ChatWindow {...mockProps} />);
    
    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' });
    });
  });

  it('prevents sending empty messages', async () => {
    const user = userEvent.setup();
    render(<ChatWindow {...mockProps} />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    });

    const sendButton = screen.getByRole('button', { name: /send message/i });
    
    // Button should be disabled when input is empty
    expect(sendButton).toBeDisabled();
    
    // Try to click disabled button
    await user.click(sendButton);
    
    // No message should be sent (button stays disabled)
    expect(sendButton).toBeDisabled();
  });

  it('shows correct chat display name for direct messages', async () => {
    render(<ChatWindow {...mockProps} chatId="1" />);
    
    await waitFor(() => {
      expect(screen.getByText('Sarah Chen')).toBeInTheDocument();
    });
  });

  it('shows correct chat display name for group chats', async () => {
    render(<ChatWindow {...mockProps} chatId="2" />);
    
    await waitFor(() => {
      expect(screen.getByText('Computer Science Study Group')).toBeInTheDocument();
    });
  });

  it('logs file selections correctly', async () => {
    const { useDropzone } = require('react-dropzone');
    
    const mockFiles = [
      new File(['test'], 'test.txt', { type: 'text/plain' }),
    ];
    
    useDropzone.mockImplementation((options: any) => {
      // Simulate file drop
      setTimeout(() => {
        options.onDrop(mockFiles);
      }, 0);
      
      return {
        getRootProps: () => ({ 'data-testid': 'dropzone' }),
        getInputProps: () => ({ 'data-testid': 'file-input' }),
        isDragActive: false,
      };
    });
    
    render(<ChatWindow {...mockProps} />);
    
    await waitFor(() => {
      expect(logger.info).toHaveBeenCalledWith(
        'Files selected for upload',
        { fileCount: 1 }
      );
    });
  });
});