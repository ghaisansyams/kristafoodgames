<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The Decision Lab now has two journeys (Brand Owner and Packaging Converter) driven by the
     * client's mind maps instead of a fixed business-case/market/priority form, so a session
     * stores the visitor's role, their full set of answers, and the product that was recommended.
     */
    public function up(): void
    {
        Schema::table('decision_sessions', function (Blueprint $table) {
            $table->string('role')->nullable()->after('email');
            $table->json('answers')->nullable()->after('role');
            $table->string('recommended_product')->nullable()->after('answers');
        });
    }

    public function down(): void
    {
        Schema::table('decision_sessions', function (Blueprint $table) {
            $table->dropColumn(['role', 'answers', 'recommended_product']);
        });
    }
};
