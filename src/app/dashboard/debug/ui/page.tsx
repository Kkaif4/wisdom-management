"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Layout, Play, Send, Table as TableIcon, Type } from "lucide-react";

export default function UIUnitTest() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-12 max-w-6xl mx-auto">
      <header className="space-y-2">
        <h1 className="text-4xl font-black text-gradient uppercase tracking-tight">
          UI Components Lab
        </h1>
        <p className="text-muted-foreground font-medium">
          Verifying premium components for Wisdom Management
        </p>
      </header>

      {/* Buttons Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Play className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-black uppercase tracking-widest text-foreground/80">
            Buttons
          </h2>
        </div>

        <div className="glass rounded-3xl p-8 border-border/50">
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="outline">Outline View</Button>
            <Button variant="glass">Glass Button</Button>
            <Button variant="destructive">Delete Item</Button>
            <Button variant="ghost">Ghost Link</Button>
            <Button variant="link">Simple Link</Button>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large Premium</Button>
            <Button size="icon" variant="outline">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Inputs Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Type className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-black uppercase tracking-widest text-foreground/80">
            Inputs
          </h2>
        </div>

        <div className="glass rounded-3xl p-8 border-border/50 max-w-md">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Default Input
              </label>
              <Input placeholder="Enter your name..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Disabled State
              </label>
              <Input disabled placeholder="Can't touch this" />
            </div>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <TableIcon className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-black uppercase tracking-widest text-foreground/80">
            Tables
          </h2>
        </div>

        <div className="glass rounded-3xl border border-border/50 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>TX-90210</TableCell>
                <TableCell>
                  <span className="text-[10px] font-black px-2 py-1 rounded bg-muted/50 border border-border/50 uppercase tracking-widest">
                    Income / Receipts
                  </span>
                </TableCell>
                <TableCell className="font-mono text-emerald-600">
                  ₹12,400.00
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">
                    Settled
                  </span>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>TX-88392</TableCell>
                <TableCell>
                  <span className="text-[10px] font-black px-2 py-1 rounded bg-muted/50 border border-border/50 uppercase tracking-widest">
                    Adjustment
                  </span>
                </TableCell>
                <TableCell className="font-mono text-rose-600">
                  -₹1,200.00
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-[10px] font-black text-orange-700 uppercase tracking-tighter">
                    Pending
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
            <TableCaption>
              Showing premium table system implementation
            </TableCaption>
          </Table>
        </div>
      </section>
    </div>
  );
}
