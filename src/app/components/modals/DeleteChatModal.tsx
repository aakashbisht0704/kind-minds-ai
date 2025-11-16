"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DeleteChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    chatTitle: string;
}

export default function DeleteChatModal({ isOpen, onClose, onConfirm, chatTitle }: DeleteChatModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-red-500" />
                        Delete Chat
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete "{chatTitle}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="bg-red-500 hover:bg-red-600"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
