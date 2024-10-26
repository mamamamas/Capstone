'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function AddEventButton() {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        who: '',
        startTime: '',
        endTime: '',
        where: '',
        about: '',
        limit: ''
    })

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    when: {
                        startTime: formData.startTime,
                        endTime: formData.endTime
                    },
                    limit: formData.limit ? parseInt(formData.limit) : null
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to create event')
            }

            const newEvent = await response.json()
            toast({
                title: "Event Created",
                description: `Successfully created event: ${newEvent.title}`,
            })
            setIsOpen(false)
            setFormData({
                title: '',
                who: '',
                startTime: '',
                endTime: '',
                where: '',
                about: '',
                limit: ''
            })
        } catch (error) {
            console.error('Error creating event:', error)
            toast({
                title: "Error",
                description: "Failed to create event. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>Add Event</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="who">Who</Label>
                        <Input
                            id="who"
                            name="who"
                            value={formData.who}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                                id="startTime"
                                name="startTime"
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                                id="endTime"
                                name="endTime"
                                type="datetime-local"
                                value={formData.endTime}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="where">Where</Label>
                        <Input
                            id="where"
                            name="where"
                            value={formData.where}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="about">About</Label>
                        <Textarea
                            id="about"
                            name="about"
                            value={formData.about}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="limit">Limit (optional)</Label>
                        <Input
                            id="limit"
                            name="limit"
                            type="number"
                            value={formData.limit}
                            onChange={handleInputChange}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Event'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}